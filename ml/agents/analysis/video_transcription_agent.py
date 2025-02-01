from typing import Dict, List, Optional, Union, Any
import torch
import torch.nn as nn
from pathlib import Path
import logging
from ..base.base_agent import BaseAgent
from ...core.models import TransformerModel
from ...utils.logger import setup_logger
from .video_preprocessing import VideoPreprocessor
import ctcdecode
import numpy as np
from transformers import Wav2Vec2Processor, Wav2Vec2ForCTC
import string
import time
from datetime import datetime

logger = setup_logger(__name__)

class VideoTranscriptionAgent(BaseAgent):
    """Agent responsible for transcribing French video content with continuous learning capabilities."""
    
    def __init__(
        self,
        model_path: Optional[str] = None,
        device: str = "cuda" if torch.cuda.is_available() else "cpu",
        batch_size: int = 32,
        learning_rate: float = 1e-4,
        max_sequence_length: int = 512,
        # Using LeBenchmark's state-of-the-art French model
        # Performance metrics:
        # - WER (Word Error Rate): ~3.9% (best in class)
        # - Trained on 7000 hours of French speech
        # - Better handling of informal/colloquial French
        # - Superior noise resistance
        # - Improved accent handling
        pretrained_model: str = "LeBenchmark/wav2vec2-FR-7K-large"
    ):
        super().__init__()
        self.device = device
        self.batch_size = batch_size
        self.learning_rate = learning_rate
        self.max_sequence_length = max_sequence_length
        
        # Initialize video preprocessor
        self.preprocessor = VideoPreprocessor(
            sample_rate=16000,  # Required sample rate for Wav2Vec2
            n_mels=80,
            n_fft=400,
            hop_length=160,
            win_length=400,
            normalize_audio=True
        )
        
        # Load pre-trained French speech recognition model and processor
        self.processor = Wav2Vec2Processor.from_pretrained(pretrained_model)
        self.model = Wav2Vec2ForCTC.from_pretrained(pretrained_model).to(device)
        
        # French-specific characters
        self.french_chars = list(string.ascii_lowercase + string.digits + string.punctuation + 'éèêëàâäôöûüçîïù ')
        self.char_to_idx = {char: idx for idx, char in enumerate(self.french_chars)}
        self.idx_to_char = {idx: char for idx, char in enumerate(self.french_chars)}
        
        # Initialize CTC decoder with French vocabulary
        self._init_decoder()
        
        # Load custom fine-tuned weights if provided
        if model_path and Path(model_path).exists():
            self.load_model(model_path)
            logger.info(f"Loaded fine-tuned model from {model_path}")
        
        # Initialize optimizer
        self.optimizer = torch.optim.Adam(self.model.parameters(), lr=learning_rate)
        self.criterion = nn.CTCLoss(blank=0, reduction='mean')
        
        logger.info(f"Initialized French VideoTranscriptionAgent on device: {device}")
    
    def _init_decoder(self):
        """Initialize CTC decoder with French vocabulary."""
        self.decoder = ctcdecode.CTCBeamDecoder(
            labels=self.french_chars,
            model_path=None,
            alpha=0,
            beta=0,
            cutoff_top_n=40,
            cutoff_prob=1.0,
            beam_width=100,
            num_processes=4,
            blank_id=0,
            log_probs_input=True
        )
    
    def preprocess_video(self, video_path: str) -> torch.Tensor:
        """Extract audio features from video and prepare for French speech recognition."""
        try:
            # Extract audio using VideoPreprocessor
            waveform, _ = self.preprocessor.extract_audio(video_path)
            
            # Prepare features using Wav2Vec2 processor
            inputs = self.processor(
                waveform.squeeze().numpy(),
                sampling_rate=self.preprocessor.sample_rate,
                return_tensors="pt",
                padding=True,
                max_length=self.max_sequence_length,
                truncation=True
            )
            
            return inputs.input_values.to(self.device)
        except Exception as e:
            logger.error(f"Error preprocessing video: {str(e)}")
            raise
    
    def transcribe(self, video_path: str) -> Dict[str, Union[str, float]]:
        """Transcribe a French video file to text."""
        try:
            # Set model to evaluation mode
            self.model.eval()
            
            # Preprocess video
            inputs = self.preprocess_video(video_path)
            
            with torch.no_grad():
                # Generate transcription
                outputs = self.model(inputs)
                logits = outputs.logits
                
                # Convert to log probabilities
                log_probs = torch.log_softmax(logits, dim=-1)
                
                # Decode output probabilities to text
                transcript = self._decode_predictions(log_probs)
                
                # Calculate confidence score
                confidence = self._calculate_confidence(log_probs)
                
                # Post-process French text
                transcript = self._postprocess_french_text(transcript)
            
            return {
                "transcript": transcript,
                "confidence": confidence
            }
        except Exception as e:
            logger.error(f"Error transcribing video: {str(e)}")
            raise
    
    def _postprocess_french_text(self, text: str) -> str:
        """Apply French-specific post-processing to the transcript."""
        try:
            # Add spaces around punctuation marks
            for punct in '.,!?':
                text = text.replace(punct, f' {punct} ')
            
            # Fix common French contractions
            text = text.replace("l ' ", "l'")
            text = text.replace("d ' ", "d'")
            text = text.replace("j ' ", "j'")
            text = text.replace("n ' ", "n'")
            text = text.replace("c ' ", "c'")
            text = text.replace("s ' ", "s'")
            
            # Clean up extra spaces
            text = ' '.join(text.split())
            
            # Capitalize first letter of sentences
            sentences = text.split('. ')
            sentences = [s.capitalize() for s in sentences]
            text = '. '.join(sentences)
            
            return text
        except Exception as e:
            logger.error(f"Error post-processing French text: {str(e)}")
            raise
    
    def train_step(self, batch: Dict[str, torch.Tensor]) -> float:
        """Perform a single training step."""
        try:
            self.model.train()
            self.optimizer.zero_grad()
            
            # Unpack batch
            input_values = batch["input_values"].to(self.device)
            labels = batch["labels"].to(self.device)
            
            # Forward pass
            outputs = self.model(input_values, labels=labels)
            loss = outputs.loss
            
            # Backward pass
            loss.backward()
            
            # Clip gradients
            torch.nn.utils.clip_grad_norm_(self.model.parameters(), max_norm=1.0)
            
            # Update weights
            self.optimizer.step()
            
            return loss.item()
        except Exception as e:
            logger.error(f"Error in training step: {str(e)}")
            raise
    
    def train(
        self,
        train_loader: torch.utils.data.DataLoader,
        val_loader: Optional[torch.utils.data.DataLoader] = None,
        num_epochs: int = 10,
        save_path: Optional[str] = None
    ) -> Dict[str, List[float]]:
        """Train the model on a dataset of French videos with transcripts."""
        try:
            history = {
                "train_loss": [],
                "val_loss": [] if val_loader else None
            }
            
            for epoch in range(num_epochs):
                # Training phase
                epoch_loss = 0.0
                for batch_idx, batch in enumerate(train_loader):
                    loss = self.train_step(batch)
                    epoch_loss += loss
                    
                    if batch_idx % 10 == 0:
                        logger.info(f"Epoch {epoch+1}/{num_epochs} - Batch {batch_idx} - Loss: {loss:.4f}")
                
                avg_epoch_loss = epoch_loss / len(train_loader)
                history["train_loss"].append(avg_epoch_loss)
                
                # Validation phase
                if val_loader:
                    val_loss = self.validate(val_loader)
                    history["val_loss"].append(val_loss)
                    logger.info(f"Epoch {epoch+1}/{num_epochs} - Train Loss: {avg_epoch_loss:.4f} - Val Loss: {val_loss:.4f}")
                else:
                    logger.info(f"Epoch {epoch+1}/{num_epochs} - Train Loss: {avg_epoch_loss:.4f}")
                
                # Save checkpoint
                if save_path:
                    self.save_model(f"{save_path}/checkpoint_epoch_{epoch+1}.pt")
            
            return history
        except Exception as e:
            logger.error(f"Error during training: {str(e)}")
            raise
    
    def validate(self, val_loader: torch.utils.data.DataLoader) -> float:
        """Evaluate the model on a validation set."""
        try:
            self.model.eval()
            total_loss = 0.0
            
            with torch.no_grad():
                for batch in val_loader:
                    # Unpack batch
                    input_values = batch["input_values"].to(self.device)
                    labels = batch["labels"].to(self.device)
                    
                    # Forward pass
                    outputs = self.model(input_values, labels=labels)
                    loss = outputs.loss
                    total_loss += loss.item()
            
            return total_loss / len(val_loader)
        except Exception as e:
            logger.error(f"Error during validation: {str(e)}")
            raise
    
    def save_model(self, path: str):
        """Save model weights and configuration to disk."""
        try:
            # Save Wav2Vec2 model
            self.model.save_pretrained(path)
            self.processor.save_pretrained(path)
            
            # Save training state and hyperparameters
            torch.save({
                "optimizer_state_dict": self.optimizer.state_dict(),
                "hyperparameters": {
                    "batch_size": self.batch_size,
                    "learning_rate": self.learning_rate,
                    "max_sequence_length": self.max_sequence_length
                }
            }, f"{path}/training_state.pt")
            
            logger.info(f"Saved model checkpoint to {path}")
        except Exception as e:
            logger.error(f"Error saving model: {str(e)}")
            raise
    
    def load_model(self, path: str):
        """Load model weights and configuration from disk."""
        try:
            # Load Wav2Vec2 model
            self.model = Wav2Vec2ForCTC.from_pretrained(path).to(self.device)
            self.processor = Wav2Vec2Processor.from_pretrained(path)
            
            # Load training state and hyperparameters
            training_state = torch.load(f"{path}/training_state.pt", map_location=self.device)
            self.optimizer.load_state_dict(training_state["optimizer_state_dict"])
            
            # Load hyperparameters
            hyperparameters = training_state["hyperparameters"]
            self.batch_size = hyperparameters["batch_size"]
            self.learning_rate = hyperparameters["learning_rate"]
            self.max_sequence_length = hyperparameters["max_sequence_length"]
            
            logger.info(f"Loaded model checkpoint from {path}")
        except Exception as e:
            logger.error(f"Error loading model: {str(e)}")
            raise
    
    def _decode_predictions(self, log_probs: torch.Tensor) -> str:
        """Convert model output logits to French text transcript."""
        try:
            # Get predicted ids
            predicted_ids = torch.argmax(log_probs, dim=-1)
            
            # Decode to text using Wav2Vec2 processor
            transcription = self.processor.batch_decode(predicted_ids)
            
            # Return first (and only) transcript
            return transcription[0]
        except Exception as e:
            logger.error(f"Error decoding predictions: {str(e)}")
            raise
    
    def _calculate_confidence(self, log_probs: torch.Tensor) -> float:
        """Calculate confidence score for the transcription."""
        try:
            # Get the maximum probability at each timestep
            max_probs = torch.exp(log_probs).max(dim=-1)[0]
            
            # Calculate average confidence
            confidence = max_probs.mean().item()
            
            return confidence
        except Exception as e:
            logger.error(f"Error calculating confidence: {str(e)}")
            raise

    def prepare_coordination_output(self, transcript_result: Dict[str, Union[str, float]]) -> Dict[str, Any]:
        """Format transcription results for coordination agents."""
        try:
            # Format for MetaAgent and StrategyCoordinator
            output = {
                "agent_type": "transcription",
                "timestamp": datetime.now().isoformat(),
                "analysis": {
                    "transcript": transcript_result["transcript"],
                    "confidence": transcript_result["confidence"],
                    "language": "fr",
                    "metadata": {
                        "model": "LeBenchmark/wav2vec2-FR-7K-large",
                        "processing_time": time.time() - self._start_time if hasattr(self, '_start_time') else None,
                        "word_count": len(transcript_result["transcript"].split())
                    }
                },
                "recommendations": self._generate_recommendations(transcript_result),
                "status": "success" if transcript_result["confidence"] > 0.5 else "low_confidence",
                "priority": self._calculate_priority(transcript_result),
                "zones_impact": ["content", "quality", "user_experience"],
                "category": "analysis"
            }

            # Add fields required by RecommendationResolver
            for rec in output["recommendations"]:
                rec.update({
                    "timestamp": datetime.now().isoformat(),
                    "category": rec["type"],  # Map type to category for resolver
                    "resource_requirements": None,  # No specific resource needs
                    "timing": {
                        "urgency": "immediate" if rec["priority"] == "high" else "normal",
                        "duration": "short"
                    }
                })

            return output
        except Exception as e:
            logger.error(f"Error preparing coordination output: {str(e)}")
            return {
                "agent_type": "transcription",
                "timestamp": datetime.now().isoformat(),
                "status": "error",
                "error": str(e),
                "category": "error"
            }

    def _calculate_priority(self, transcript_result: Dict[str, Union[str, float]]) -> int:
        """Calculate overall priority based on transcription results."""
        priority = 1  # Default low priority
        
        # Increase priority for low confidence
        if transcript_result["confidence"] < 0.7:
            priority += 1
        if transcript_result["confidence"] < 0.5:
            priority += 1
            
        # Increase priority for very long transcripts
        word_count = len(transcript_result["transcript"].split())
        if word_count > 100:
            priority += 1
            
        return min(priority, 3)  # Cap at 3 (highest priority)

    def _generate_recommendations(self, transcript_result: Dict[str, Union[str, float]]) -> List[Dict[str, Any]]:
        """Generate recommendations based on transcription results."""
        recommendations = []
        
        # Add recommendation if confidence is low
        if transcript_result["confidence"] < 0.7:
            recommendations.append({
                "type": "quality",
                "priority": "high",
                "action": "review",
                "reason": "Low transcription confidence",
                "details": {
                    "confidence_score": transcript_result["confidence"],
                    "threshold": 0.7
                }
            })
        
        # Add recommendation for very long transcripts
        word_count = len(transcript_result["transcript"].split())
        if word_count > 100:  # Assuming this is a lot for short social media videos
            recommendations.append({
                "type": "content",
                "priority": "medium",
                "action": "optimize",
                "reason": "Transcript length may be too long for social media",
                "details": {
                    "word_count": word_count,
                    "recommended_max": 100
                }
            })
        
        return recommendations

    def process_video(self, video_path: str) -> Dict[str, Any]:
        """Process video and prepare results for coordination agents."""
        try:
            self._start_time = time.time()
            
            # Perform transcription
            transcript_result = self.transcribe(video_path)
            
            # Prepare output for coordination
            coordination_output = self.prepare_coordination_output(transcript_result)
            
            # Log success
            logger.info(f"Successfully processed video: {video_path}")
            
            return coordination_output
        except Exception as e:
            logger.error(f"Error processing video: {str(e)}")
            return {
                "agent_type": "transcription",
                "timestamp": datetime.now().isoformat(),
                "status": "error",
                "error": str(e)
            } 