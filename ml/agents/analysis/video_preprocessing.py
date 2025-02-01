import torch
import torchaudio
import numpy as np
from pathlib import Path
import logging
from typing import Tuple, Optional
import moviepy.editor as mp
from ...utils.logger import setup_logger

logger = setup_logger(__name__)

class VideoPreprocessor:
    """Handles video preprocessing for the transcription model."""
    
    def __init__(
        self,
        sample_rate: int = 16000,
        n_mels: int = 80,
        n_fft: int = 400,
        hop_length: int = 160,
        win_length: int = 400,
        normalize_audio: bool = True
    ):
        self.sample_rate = sample_rate
        self.n_mels = n_mels
        self.n_fft = n_fft
        self.hop_length = hop_length
        self.win_length = win_length
        self.normalize_audio = normalize_audio
        
        # Initialize mel spectrogram transform
        self.mel_transform = torchaudio.transforms.MelSpectrogram(
            sample_rate=sample_rate,
            n_mels=n_mels,
            n_fft=n_fft,
            hop_length=hop_length,
            win_length=win_length
        )
        
        # Initialize audio normalization
        self.normalizer = torchaudio.transforms.Normalize(mean=0, std=20)
        
        logger.info(
            f"Initialized VideoPreprocessor with params: "
            f"sample_rate={sample_rate}, n_mels={n_mels}, "
            f"n_fft={n_fft}, hop_length={hop_length}"
        )
    
    def extract_audio(
        self,
        video_path: str,
        output_path: Optional[str] = None
    ) -> Tuple[torch.Tensor, int]:
        """Extract audio from video file."""
        try:
            # Load video
            video = mp.VideoFileClip(video_path)
            
            # Extract audio
            audio = video.audio
            
            if output_path:
                # Save audio to file
                audio.write_audiofile(
                    output_path,
                    fps=self.sample_rate,
                    nbytes=2,
                    buffersize=2000,
                    codec='pcm_s16le',
                    ffmpeg_params=["-ac", "1"]  # Force mono
                )
                
                # Load saved audio file
                waveform, sample_rate = torchaudio.load(output_path)
            else:
                # Extract audio data directly
                audio_array = audio.to_soundarray(fps=self.sample_rate)
                waveform = torch.FloatTensor(audio_array).mean(dim=1, keepdim=True)
                sample_rate = self.sample_rate
            
            # Close video to free resources
            video.close()
            
            if sample_rate != self.sample_rate:
                # Resample if necessary
                resampler = torchaudio.transforms.Resample(
                    orig_freq=sample_rate,
                    new_freq=self.sample_rate
                )
                waveform = resampler(waveform)
            
            if self.normalize_audio:
                # Normalize audio
                waveform = self.normalizer(waveform)
            
            return waveform, self.sample_rate
        
        except Exception as e:
            logger.error(f"Error extracting audio from video: {str(e)}")
            raise
    
    def compute_mel_spectrogram(
        self,
        waveform: torch.Tensor,
        normalize: bool = True
    ) -> torch.Tensor:
        """Compute mel spectrogram from audio waveform."""
        try:
            # Compute mel spectrogram
            mel_spec = self.mel_transform(waveform)
            
            if normalize:
                # Convert to log scale
                mel_spec = torch.log(mel_spec + 1e-9)
                
                # Normalize
                mean = mel_spec.mean()
                std = mel_spec.std()
                mel_spec = (mel_spec - mean) / (std + 1e-9)
            
            return mel_spec
        
        except Exception as e:
            logger.error(f"Error computing mel spectrogram: {str(e)}")
            raise
    
    def process_video(
        self,
        video_path: str,
        max_length: Optional[int] = None
    ) -> torch.Tensor:
        """Extract features from video file."""
        try:
            # Extract audio
            waveform, _ = self.extract_audio(video_path)
            
            # Compute mel spectrogram
            features = self.compute_mel_spectrogram(waveform)
            
            if max_length is not None:
                # Pad or truncate to max_length
                curr_length = features.size(1)
                if curr_length > max_length:
                    features = features[:, :max_length]
                elif curr_length < max_length:
                    pad_amount = max_length - curr_length
                    features = torch.nn.functional.pad(
                        features,
                        (0, pad_amount),
                        mode='constant',
                        value=0
                    )
            
            # Add batch dimension
            features = features.unsqueeze(0)
            
            return features
        
        except Exception as e:
            logger.error(f"Error processing video: {str(e)}")
            raise 