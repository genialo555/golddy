import torch
import numpy as np
import pandas as pd
from pathlib import Path
from typing import Dict, Optional, List, Tuple
from datetime import datetime, timedelta
import logging

from .trend_processor import TrendProcessor
from .agent_training_sets import TrainingDatasets
from .models import UnifiedTrendLSTM

class TrendAgent:
    """Agent d'analyse des tendances Instagram utilisant le modèle LSTM unifié"""
    
    def __init__(self,
                 model_config: Optional[Dict] = None,
                 sequence_length: int = 30,
                 model_path: Optional[str] = None):
        """
        Initialise l'agent d'analyse des tendances
        
        Args:
            model_config: Configuration du modèle LSTM
            sequence_length: Longueur des séquences pour l'analyse
            model_path: Chemin vers un modèle pré-entraîné
        """
        self.logger = logging.getLogger(__name__)
        self.processor = TrendProcessor(
            sequence_length=sequence_length,
            model_config=model_config
        )
        
        if model_path:
            self.load_model(model_path)
            
        self.metrics_history = []
        
    def train(self, 
              posts_df: pd.DataFrame,
              hashtags_df: Optional[pd.DataFrame] = None,
              validation_split: float = 0.2,
              epochs: int = 50,
              batch_size: int = 32,
              early_stopping_patience: int = 5,
              save_dir: Optional[str] = None) -> Dict:
        """
        Entraîne l'agent sur de nouvelles données
        
        Args:
            posts_df: DataFrame des posts Instagram
            hashtags_df: DataFrame des hashtags (optionnel)
            validation_split: Proportion des données pour la validation
            epochs: Nombre d'époques d'entraînement
            batch_size: Taille des batchs
            early_stopping_patience: Patience pour l'early stopping
            save_dir: Répertoire de sauvegarde du modèle
            
        Returns:
            Dict contenant l'historique d'entraînement et les métriques
        """
        try:
            # Préparation des données
            training_data = self.processor.prepare_training_data(posts_df, hashtags_df)
            
            # Division train/validation
            n_val = int(len(training_data['engagement_sequences']) * validation_split)
            train_sequences = training_data['engagement_sequences'][:-n_val]
            val_sequences = training_data['engagement_sequences'][-n_val:]
            
            # Entraînement
            training_history = self.processor.train_engagement_model(
                train_sequences=train_sequences,
                val_sequences=val_sequences,
                epochs=epochs,
                batch_size=batch_size,
                early_stopping_patience=early_stopping_patience
            )
            
            # Évaluation
            val_metrics = self.processor.evaluate(val_sequences)
            
            # Sauvegarde du modèle si un répertoire est spécifié
            if save_dir:
                save_path = Path(save_dir)
                save_path.mkdir(parents=True, exist_ok=True)
                
                timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
                model_path = save_path / f"trend_agent_{timestamp}.pt"
                
                self.save_model(model_path, {
                    'training_history': training_history,
                    'validation_metrics': val_metrics,
                    'timestamp': timestamp
                })
            
            # Mise à jour de l'historique des métriques
            self.metrics_history.append({
                'timestamp': datetime.now(),
                'metrics': val_metrics,
                'training_samples': len(train_sequences)
            })
            
            return {
                'training_history': training_history,
                'validation_metrics': val_metrics
            }
            
        except Exception as e:
            self.logger.error(f"Erreur lors de l'entraînement: {str(e)}")
            raise
            
    def analyze_trends(self, 
                      recent_data: pd.DataFrame,
                      window_size: int = 7) -> Dict:
        """
        Analyse les tendances récentes et fait des prédictions
        
        Args:
            recent_data: DataFrame des données récentes
            window_size: Taille de la fenêtre d'analyse en jours
            
        Returns:
            Dict contenant les analyses et prédictions
        """
        try:
            # Préparation des données temporelles
            recent_data['timestamp'] = pd.to_datetime(recent_data['timestamp'])
            recent_data = recent_data.sort_values('timestamp')
            
            # Calcul des tendances sur la fenêtre
            window_data = recent_data.set_index('timestamp').last(f"{window_size}D")
            
            # Prédictions
            predictions = self.processor.predict_trends(window_data)
            
            # Analyse des tendances actuelles
            current_trends = {
                'engagement_growth': window_data['engagement_rate'].pct_change().mean(),
                'volatility': window_data['engagement_rate'].std() / window_data['engagement_rate'].mean(),
                'trend_strength': abs(predictions['trend_direction']) * predictions['direction_confidence']
            }
            
            return {
                'predictions': predictions,
                'current_trends': current_trends,
                'analysis_window': {
                    'start': window_data.index[0],
                    'end': window_data.index[-1]
                }
            }
            
        except Exception as e:
            self.logger.error(f"Erreur lors de l'analyse des tendances: {str(e)}")
            raise
            
    def save_model(self, path: str, extra_data: Optional[Dict] = None):
        """Sauvegarde le modèle et les données associées"""
        self.processor.save_checkpoint(path, extra_data)
        
    def load_model(self, path: str):
        """Charge un modèle pré-entraîné"""
        self.processor.load_checkpoint(path)
        
    def get_performance_metrics(self) -> Dict:
        """Retourne les métriques de performance de l'agent"""
        if not self.metrics_history:
            return {}
            
        recent_metrics = self.metrics_history[-1]['metrics']
        return {
            'current_performance': recent_metrics,
            'historical_mse': [m['metrics']['mse'] for m in self.metrics_history],
            'historical_mae': [m['metrics']['mae'] for m in self.metrics_history],
            'historical_r2': [m['metrics']['r2'] for m in self.metrics_history],
            'total_training_samples': sum(m['training_samples'] for m in self.metrics_history)
        } 