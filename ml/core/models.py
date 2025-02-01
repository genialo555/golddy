# Standard library imports
import logging
from pathlib import Path
from typing import Optional, Dict, Any, Tuple

# Third-party imports
import pandas as pd
import torch
import torch.nn as nn
import torch.nn.functional as F
from transformers import (
    AutoModel,
    AutoTokenizer,
    PreTrainedModel,
    PreTrainedTokenizer
)
import math

# Local imports
from utils.translation import FrenchTranslator

class InstagramContentEncoder(nn.Module):
    def __init__(self, input_size=10, hidden_size=128, num_classes=1):
        super().__init__()
        self.logger = logging.getLogger(__name__)
        
        # Numerical features encoder
        self.feature_encoder = nn.Sequential(
            nn.Linear(input_size, hidden_size),
            nn.ReLU(),
            nn.Dropout(0.2),
            nn.Linear(hidden_size, hidden_size // 2),
            nn.ReLU(),
            nn.Linear(hidden_size // 2, num_classes)
        )
        
        # Move model to GPU if available
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        self.to(self.device)
        
    def forward(self, x):
        return self.feature_encoder(x)

    def train(self, data, epochs=10, batch_size=32):
        """Entraîne le modèle sur les données fournies"""
        self.logger.info(f"Démarrage de l'entraînement sur {len(data)} échantillons...")
        
        try:
            # Configuration de l'optimiseur
            optimizer = torch.optim.Adam(self.parameters())
            criterion = nn.MSELoss()
            
            if isinstance(data, pd.DataFrame):
                # Conversion en tenseurs
                features = torch.tensor(data.values, dtype=torch.float32)
                targets = torch.tensor(data['engagement_rate'].values, dtype=torch.float32).reshape(-1, 1)
                
                # Normalisation des features
                features_mean = features.mean(dim=0)
                features_std = features.std(dim=0)
                features = (features - features_mean) / (features_std + 1e-8)
                
                # Création des mini-batches
                n_samples = len(data)
                n_batches = (n_samples + batch_size - 1) // batch_size
                
                # Boucle d'entraînement
                for epoch in range(epochs):
                    total_loss = 0
                    
                    for i in range(n_batches):
                        start_idx = i * batch_size
                        end_idx = min((i + 1) * batch_size, n_samples)
                        
                        batch_features = features[start_idx:end_idx].to(self.device)
                        batch_targets = targets[start_idx:end_idx].to(self.device)
                        
                        # Forward pass
                        outputs = self.forward(batch_features)
                        loss = criterion(outputs, batch_targets)
                        
                        # Backward pass
                        optimizer.zero_grad()
                        loss.backward()
                        optimizer.step()
                        
                        total_loss += loss.item()
                    
                    avg_loss = total_loss / n_batches
                    self.logger.info(f"Epoch {epoch+1}/{epochs}, Loss moyenne: {avg_loss:.4f}")
            else:
                raise ValueError("Les données doivent être un DataFrame pandas")
                
        except Exception as e:
            self.logger.error(f"Erreur pendant l'entraînement: {e}")
            raise

    def save(self, path):
        """Sauvegarde le modèle"""
        try:
            Path(path).parent.mkdir(exist_ok=True)
            torch.save(self.state_dict(), path)
            self.logger.info(f"Modèle sauvegardé: {path}")
        except Exception as e:
            self.logger.error(f"Erreur lors de la sauvegarde: {e}")
            raise

class LSTMTrendPredictor(nn.Module):
    def __init__(self, input_size=64, hidden_size=128):
        super().__init__()
        self.lstm = nn.LSTM(input_size, hidden_size, batch_first=True)
        self.fc = nn.Linear(hidden_size, 1)
    
    def forward(self, x):
        # Ensure input is 3D: [batch_size, sequence_length, features]
        if len(x.shape) == 2:
            batch_size, features = x.shape
            x = x.view(batch_size, 1, features)
        
        # Passage dans le LSTM
        out, _ = self.lstm(x)
        
        # Utilisation de la dernière sortie
        last_out = out[:, -1, :]
        
        # Prédiction finale
        return self.fc(last_out)

class EnhancedTrendLSTM(nn.Module):
    def __init__(self, input_size, hidden_size=128):
        super(EnhancedTrendLSTM, self).__init__()
        self.hidden_size = hidden_size
        
        # Input normalization
        self.batch_norm1 = nn.BatchNorm1d(input_size)
        
        # LSTM layers
        self.lstm1 = nn.LSTM(
            input_size=input_size,
            hidden_size=hidden_size,
            num_layers=3,
            batch_first=True,
            bidirectional=True,
            dropout=0.3
        )
        
        self.lstm2 = nn.LSTM(
            input_size=hidden_size * 2,
            hidden_size=hidden_size * 2,
            num_layers=3,
            batch_first=True,
            bidirectional=True,
            dropout=0.3
        )
        
        # Attention layers
        self.attention1 = nn.MultiheadAttention(
            embed_dim=hidden_size * 2,
            num_heads=8,
            dropout=0.3,
            batch_first=True
        )
        
        self.attention2 = nn.MultiheadAttention(
            embed_dim=hidden_size * 4,
            num_heads=16,
            dropout=0.3,
            batch_first=True
        )
        
        # Layer normalization
        self.layer_norm1 = nn.LayerNorm(hidden_size * 2)
        self.layer_norm2 = nn.LayerNorm(hidden_size * 4)
        
        # Fully connected layers
        self.fc1 = nn.Linear(hidden_size * 4, hidden_size * 2)
        self.fc2 = nn.Linear(hidden_size * 2, hidden_size)
        self.fc3 = nn.Linear(hidden_size, hidden_size // 2)
        self.fc4 = nn.Linear(hidden_size // 2, 1)
        
        # Batch normalization
        self.batch_norm2 = nn.BatchNorm1d(hidden_size * 2)
        self.batch_norm3 = nn.BatchNorm1d(hidden_size)
        self.batch_norm4 = nn.BatchNorm1d(hidden_size // 2)
        
        # Dropout
        self.dropout = nn.Dropout(0.4)
        
        # Initialize weights
        self._init_weights()
    
    def _init_weights(self):
        for name, param in self.named_parameters():
            if 'weight' in name and len(param.shape) >= 2:
                nn.init.kaiming_normal_(param, mode='fan_out', nonlinearity='relu')
            elif 'bias' in name:
                nn.init.constant_(param, 0.0)
    
    def forward(self, x):
        # Ajout d'une dimension temporelle si nécessaire
        if len(x.shape) == 2:
            x = x.unsqueeze(1)  # [batch_size, 1, features]
        
        # Input normalization
        x = x.transpose(1, 2)
        x = self.batch_norm1(x)
        x = x.transpose(1, 2)
        
        # First LSTM layer with residual connection
        lstm1_out, _ = self.lstm1(x)
        attn1_out, _ = self.attention1(lstm1_out, lstm1_out, lstm1_out)
        lstm1_out = self.layer_norm1(lstm1_out + attn1_out)
        lstm1_out = self.dropout(lstm1_out)
        
        # Second LSTM layer with residual connection
        lstm2_out, _ = self.lstm2(lstm1_out)
        attn2_out, _ = self.attention2(lstm2_out, lstm2_out, lstm2_out)
        lstm2_out = self.layer_norm2(lstm2_out + attn2_out)
        lstm2_out = self.dropout(lstm2_out)
        
        # Global context vector through attention
        context = torch.mean(lstm2_out, dim=1)
        
        # Fully connected layers with skip connections
        fc1_out = self.fc1(context)
        fc1_out = self.batch_norm2(fc1_out)
        fc1_out = F.relu(fc1_out)
        fc1_out = self.dropout(fc1_out)
        
        # Skip connection from context
        fc2_in = fc1_out + self.dropout(context[:, :self.hidden_size * 2])
        fc2_out = self.fc2(fc2_in)
        fc2_out = self.batch_norm3(fc2_out)
        fc2_out = F.relu(fc2_out)
        fc2_out = self.dropout(fc2_out)
        
        fc3_out = self.fc3(fc2_out)
        fc3_out = self.batch_norm4(fc3_out)
        fc3_out = F.relu(fc3_out)
        
        # Final prediction
        out = self.fc4(fc3_out)
        
        return out.squeeze(-1)

    def fit(self, data, epochs=20, batch_size=64):
        """Entraîne le modèle sur les données fournies"""
        self.logger.info(f"Démarrage de l'entraînement sur {len(data)} séquences...")
        
        try:
            # Configuration de l'optimiseur
            optimizer = torch.optim.Adam(self.parameters())
            criterion = nn.MSELoss()
            
            if isinstance(data, pd.DataFrame):
                # Sélection et préparation des features
                features = ['engagement_rate']
                if 'likes' in data.columns:
                    features.append('likes')
                if 'comments' in data.columns:
                    features.append('comments')
                
                sequence_data = data[features].values
                
                # Normalisation
                mean = sequence_data.mean(axis=0)
                std = sequence_data.std(axis=0)
                sequence_data = (sequence_data - mean) / (std + 1e-8)
                
                # Création des séquences
                X, y = [], []
                sequence_length = 10  # Réduit à 10 pour l'exemple
                
                for i in range(len(sequence_data) - sequence_length):
                    X.append(sequence_data[i:i+sequence_length])
                    y.append(sequence_data[i+sequence_length, 0])  # Prédiction du taux d'engagement
                
                X = torch.FloatTensor(X)
                y = torch.FloatTensor(y).reshape(-1, 1)
                
                # Entraînement
                n_samples = len(X)
                n_batches = (n_samples + batch_size - 1) // batch_size
                
                for epoch in range(epochs):
                    total_loss = 0
                    
                    for i in range(n_batches):
                        start_idx = i * batch_size
                        end_idx = min((i + 1) * batch_size, n_samples)
                        
                        batch_X = X[start_idx:end_idx].to(self.device)
                        batch_y = y[start_idx:end_idx].to(self.device)
                        
                        # Forward pass
                        outputs = self.forward(batch_X)
                        loss = criterion(outputs, batch_y)
                        
                        # Backward pass
                        optimizer.zero_grad()
                        loss.backward()
                        optimizer.step()
                        
                        total_loss += loss.item()
                    
                    avg_loss = total_loss / n_batches
                    self.logger.info(f"Epoch {epoch+1}/{epochs}, Loss moyenne: {avg_loss:.4f}")
            else:
                raise ValueError("Les données doivent être un DataFrame pandas")
                
        except Exception as e:
            self.logger.error(f"Erreur pendant l'entraînement: {e}")
            raise 

class PositionalEncoding(nn.Module):
    """Inject information about the relative or absolute position of tokens in sequence."""
    
    def __init__(self, d_model: int, dropout: float = 0.1, max_len: int = 5000):
        super().__init__()
        self.dropout = nn.Dropout(p=dropout)

        position = torch.arange(max_len).unsqueeze(1)
        div_term = torch.exp(torch.arange(0, d_model, 2) * (-math.log(10000.0) / d_model))
        pe = torch.zeros(max_len, 1, d_model)
        pe[:, 0, 0::2] = torch.sin(position * div_term)
        pe[:, 0, 1::2] = torch.cos(position * div_term)
        self.register_buffer('pe', pe)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        """
        Args:
            x: Tensor, shape [seq_len, batch_size, embedding_dim]
        """
        x = x + self.pe[:x.size(0)]
        return self.dropout(x)

class TransformerModel(nn.Module):
    """Transformer model for speech recognition."""
    
    def __init__(
        self,
        input_dim: int = 80,
        num_heads: int = 8,
        num_layers: int = 6,
        d_model: int = 512,
        d_ff: int = 2048,
        dropout: float = 0.1,
        vocab_size: int = 1000  # Size of target vocabulary
    ):
        super().__init__()
        
        # Feature processing
        self.feature_proj = nn.Linear(input_dim, d_model)
        self.pos_encoder = PositionalEncoding(d_model, dropout)
        
        # Transformer encoder
        encoder_layers = nn.TransformerEncoderLayer(
            d_model=d_model,
            nhead=num_heads,
            dim_feedforward=d_ff,
            dropout=dropout,
            batch_first=True
        )
        self.transformer_encoder = nn.TransformerEncoder(
            encoder_layers,
            num_layers=num_layers
        )
        
        # Output projection
        self.output_proj = nn.Linear(d_model, vocab_size)
        
        # Initialize parameters
        self._init_parameters()
    
    def _init_parameters(self):
        """Initialize model parameters."""
        for p in self.parameters():
            if p.dim() > 1:
                nn.init.xavier_uniform_(p)
    
    def forward(
        self,
        src: torch.Tensor,
        src_mask: Optional[torch.Tensor] = None,
        src_key_padding_mask: Optional[torch.Tensor] = None
    ) -> torch.Tensor:
        """
        Args:
            src: Tensor, shape [batch_size, seq_len, feature_dim]
            src_mask: Optional mask for padding in the sequence
            src_key_padding_mask: Optional mask for padding in the batch
            
        Returns:
            output: Tensor, shape [batch_size, seq_len, vocab_size]
        """
        # Project features to model dimension
        x = self.feature_proj(src)
        
        # Add positional encoding
        x = self.pos_encoder(x)
        
        # Pass through transformer encoder
        memory = self.transformer_encoder(
            x,
            mask=src_mask,
            src_key_padding_mask=src_key_padding_mask
        )
        
        # Project to vocabulary size
        output = self.output_proj(memory)
        
        return output
    
    def predict_lengths(self, logits: torch.Tensor) -> torch.Tensor:
        """Predict output sequence lengths for CTC loss."""
        # For CTC, output length is determined by the input length
        # We assume no length reduction in the model
        return torch.full(
            (logits.size(0),),
            logits.size(1),
            dtype=torch.long,
            device=logits.device
        )
    
    def generate_square_subsequent_mask(self, sz: int) -> torch.Tensor:
        """Generate a square mask for the sequence."""
        mask = (torch.triu(torch.ones(sz, sz)) == 1).transpose(0, 1)
        mask = mask.float().masked_fill(mask == 0, float('-inf')).masked_fill(mask == 1, float(0.0))
        return mask 