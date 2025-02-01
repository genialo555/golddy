from typing import Dict, Any, List, Optional, Tuple
import torch
import torch.nn as nn
from torch.utils.data import DataLoader, Dataset
import numpy as np
from collections import deque
import logging
from pathlib import Path
import random
import json
import os
from datetime import datetime, timedelta
from instagram_scraper.ml.backup_manager import BackupManager
from .security_manager import SecurityManager

class InstagramDataset(Dataset):
    """Dataset optimisé pour les données Instagram"""
    def __init__(self, data: List[Dict[str, Any]], feature_config: Dict[str, Any]):
        self.data = data
        self.feature_config = feature_config
        
    def __len__(self) -> int:
        return len(self.data)
        
    def __getitem__(self, idx: int) -> Tuple[torch.Tensor, torch.Tensor]:
        item = self.data[idx]
        features = self._extract_features(item)
        labels = self._extract_labels(item)
        return features, labels
        
    def _extract_features(self, item: Dict[str, Any]) -> torch.Tensor:
        """Extrait et normalise les features"""
        features = []
        for feature_name, config in self.feature_config.items():
            value = item.get(feature_name, config['default'])
            normalized = (value - config['mean']) / config['std']
            features.append(normalized)
        return torch.tensor(features, dtype=torch.float16)

class LightweightLearner:
    def __init__(self, config_path: str = "config/ml_config.json"):
        self.logger = logging.getLogger('lightweight_learner')
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        
        # Chargement de la configuration
        self.config = self._load_config(config_path)
        
        # Gestion mémoire optimisée
        self.memory = deque(maxlen=self.config['memory_size'])
        self.batch_size = self.config['initial_batch_size']
        self.min_batch_size = self.config['min_batch_size']
        self.learning_frequency = self.config['learning_frequency']
        
        # Stats et monitoring
        self.stats = {
            'training_iterations': 0,
            'oom_events': 0,
            'skipped_trainings': 0
        }
        
        # Initialisation des modèles
        self.models = self._initialize_models()
        self.optimizers = self._initialize_optimizers()
        self.schedulers = self._initialize_schedulers()
        
        self.backup_manager = BackupManager()
        self.last_backup = datetime.now()
        self.backup_frequency = timedelta(hours=1)  # Configurable
        
        self.security_manager = SecurityManager()
        
    def _load_config(self, config_path: str) -> Dict[str, Any]:
        """Charge la configuration avec valeurs par défaut"""
        default_config = {
            'memory_size': 10000,
            'initial_batch_size': 32,
            'min_batch_size': 8,
            'learning_frequency': 100,
            'model_configs': {
                'behavior': {'input_size': 50, 'hidden_sizes': [32, 16], 'output_size': 8},
                'engagement': {'input_size': 30, 'hidden_sizes': [20, 10], 'output_size': 4},
                'trends': {'input_size': 40, 'hidden_sizes': [25, 15], 'output_size': 6}
            },
            'learning_rates': {
                'behavior': 1e-4,
                'engagement': 1e-4,
                'trends': 1e-4
            }
        }
        
        try:
            with open(config_path, 'r') as f:
                config = json.load(f)
                return {**default_config, **config}
        except Exception as e:
            self.logger.warning(f"Could not load config: {e}. Using defaults.")
            return default_config
            
    def _initialize_models(self) -> Dict[str, nn.Module]:
        """Initialise les modèles avec chargement des checkpoints"""
        models = {}
        for model_name, config in self.config['model_configs'].items():
            model = self._create_lightweight_model(model_name, config)
            checkpoint_path = f"checkpoints/{model_name}_latest.pt"
            
            if os.path.exists(checkpoint_path):
                try:
                    checkpoint = torch.load(checkpoint_path, map_location=self.device)
                    model.load_state_dict(checkpoint['model_state'])
                    self.logger.info(f"Loaded checkpoint for {model_name}")
                except Exception as e:
                    self.logger.error(f"Error loading checkpoint for {model_name}: {e}")
                    
            models[model_name] = model
        return models
        
    def _create_lightweight_model(self, model_type: str, config: Dict[str, Any]) -> nn.Module:
        """Crée un modèle optimisé avec architecture dynamique"""
        layers = []
        sizes = [config['input_size']] + config['hidden_sizes'] + [config['output_size']]
        
        for i in range(len(sizes) - 1):
            layers.append(nn.Linear(sizes[i], sizes[i + 1]))
            if i < len(sizes) - 2:  # Pas de ReLU sur la dernière couche
                layers.append(nn.ReLU())
                layers.append(nn.Dropout(0.1))  # Léger dropout pour régularisation
                
        return nn.Sequential(*layers).to(self.device)
        
    def _preprocess_data(self, data: Dict[str, Any]) -> Dict[str, torch.Tensor]:
        """Prétraite les données pour l'apprentissage"""
        processed = {}
        try:
            # Extraction et normalisation des features
            for feature_name, config in self.config['feature_configs'].items():
                value = data.get(feature_name, config['default'])
                normalized = (value - config['mean']) / config['std']
                processed[feature_name] = torch.tensor([normalized], dtype=torch.float16)
                
            return processed
            
        except Exception as e:
            self.logger.error(f"Preprocessing error: {e}")
            return None
            
    def _has_enough_resources(self, model_name: str) -> bool:
        """Vérifie la disponibilité des ressources"""
        try:
            # Vérifie la mémoire GPU disponible
            if torch.cuda.is_available():
                memory_allocated = torch.cuda.memory_allocated()
                memory_reserved = torch.cuda.memory_reserved()
                memory_total = torch.cuda.get_device_properties(0).total_memory
                
                memory_available = memory_total - memory_allocated
                memory_usage_ratio = memory_allocated / memory_total
                
                # Seuils de sécurité
                return (memory_usage_ratio < 0.85 and  # Garde 15% libre
                        memory_available > 500 * 1024 * 1024)  # Min 500MB libre
            return True  # Sur CPU, on suppose toujours assez de ressources
            
        except Exception as e:
            self.logger.error(f"Resource check error: {e}")
            return False
        
    @SecurityManager.monitor_execution
    def learn(self, data: Dict[str, Any]) -> Dict[str, float]:
        """Apprentissage sécurisé et optimisé"""
        try:
            # Validation sécurisée des données
            validated_data = self.security_manager.validate_input(data)
            if validated_data is None:
                return {'status': 'error', 'reason': 'security_validation_failed'}
                
            # Vérifie si l'apprentissage est nécessaire
            if not self._should_learn():
                return {'status': 'skipped', 'reason': 'learning_frequency'}
                
            # Préparation des données avec gestion mémoire
            processed_data = self._preprocess_data(validated_data)
            self._update_memory(processed_data)
            
            # Apprentissage par lots avec monitoring ressources
            metrics = {}
            with torch.cuda.amp.autocast():  # Mixed precision pour optimiser VRAM
                for model_name, model in self.models.items():
                    if self._has_enough_resources(model_name):
                        batch = self._get_optimized_batch(model_name)
                        metrics[model_name] = self._train_model(model, batch)
                    else:
                        self.logger.warning(f"Skipping {model_name} due to resource constraints")
                        
            # Vérifie si un backup est nécessaire
            self._handle_auto_backup()
            
            return {
                'status': 'success',
                'metrics': metrics,
                'memory_usage': self._get_memory_stats()
            }
            
        except SecurityException as e:
            self._handle_security_exception(e)
            return {'status': 'error', 'reason': 'security_exception'}
            
    def _should_learn(self) -> bool:
        """Détermine si l'apprentissage est nécessaire"""
        memory_usage = torch.cuda.memory_allocated() / torch.cuda.max_memory_allocated()
        return (
            len(self.memory) >= self.batch_size and
            len(self.memory) % self.learning_frequency == 0 and
            memory_usage < 0.8  # Garde 20% VRAM libre
        )
        
    def _get_optimized_batch(self, model_name: str) -> torch.Tensor:
        """Prépare un batch optimisé pour la mémoire"""
        batch = random.sample(self.memory, self.batch_size)
        
        # Utilise torch.float16 pour réduire utilisation mémoire
        return torch.tensor(batch, dtype=torch.float16).to(self.device)
        
    def _train_model(self, model: nn.Module, batch: torch.Tensor) -> Dict[str, float]:
        """Entraînement optimisé d'un modèle"""
        try:
            # Libère la mémoire cache
            torch.cuda.empty_cache()
            
            # Gradient scaler pour mixed precision
            scaler = torch.cuda.amp.GradScaler()
            
            with torch.cuda.amp.autocast():
                loss = model(batch)
                
            scaler.scale(loss).backward()
            scaler.step(model.optimizer)
            scaler.update()
            
            return {'loss': loss.item()}
            
        except RuntimeError as e:
            if "out of memory" in str(e):
                self.logger.warning("OOM detected, reducing batch size")
                self.batch_size = max(8, self.batch_size // 2)
                return {'error': 'oom', 'new_batch_size': self.batch_size} 
        
    def _initialize_optimizers(self) -> Dict[str, torch.optim.Optimizer]:
        """Initialise les optimizers pour chaque modèle"""
        optimizers = {}
        for model_name, model in self.models.items():
            lr = self.config['learning_rates'][model_name]
            optimizers[model_name] = torch.optim.Adam(
                model.parameters(),
                lr=lr,
                weight_decay=1e-5  # Légère régularisation L2
            )
        return optimizers
        
    def _initialize_schedulers(self) -> Dict[str, torch.optim.lr_scheduler.ReduceLROnPlateau]:
        """Initialise les schedulers pour adaptation du learning rate"""
        return {
            name: torch.optim.lr_scheduler.ReduceLROnPlateau(
                optimizer,
                mode='min',
                factor=0.5,
                patience=5,
                min_lr=1e-6
            )
            for name, optimizer in self.optimizers.items()
        }
        
    def _update_memory(self, data: Optional[Dict[str, torch.Tensor]]) -> None:
        """Met à jour la mémoire d'expérience avec gestion des erreurs"""
        if data is None:
            self.logger.warning("Skipping memory update due to invalid data")
            return
            
        try:
            # Vérifie la validité des données
            if self._validate_data(data):
                self.memory.append(data)
                
                # Nettoyage périodique de la mémoire
                if len(self.memory) % 1000 == 0:
                    self._cleanup_memory()
                    
        except Exception as e:
            self.logger.error(f"Memory update error: {e}")
            
    def _validate_data(self, data: Dict[str, torch.Tensor]) -> bool:
        """Valide les données avant stockage"""
        try:
            required_features = set(self.config['feature_configs'].keys())
            data_features = set(data.keys())
            
            # Vérifie les features requises
            if not required_features.issubset(data_features):
                missing = required_features - data_features
                self.logger.warning(f"Missing required features: {missing}")
                return False
                
            # Vérifie les valeurs
            for feature, tensor in data.items():
                if not torch.isfinite(tensor).all():
                    self.logger.warning(f"Invalid values in feature {feature}")
                    return False
                    
            return True
            
        except Exception as e:
            self.logger.error(f"Data validation error: {e}")
            return False
            
    def _cleanup_memory(self) -> None:
        """Nettoie la mémoire des données obsolètes ou invalides"""
        try:
            valid_data = []
            for data in self.memory:
                if self._validate_data(data):
                    valid_data.append(data)
                    
            self.memory = deque(valid_data, maxlen=self.config['memory_size'])
            
        except Exception as e:
            self.logger.error(f"Memory cleanup error: {e}")
            
    def _get_memory_stats(self) -> Dict[str, Any]:
        """Récupère les statistiques d'utilisation mémoire"""
        try:
            if torch.cuda.is_available():
                return {
                    'allocated': torch.cuda.memory_allocated(),
                    'reserved': torch.cuda.memory_reserved(),
                    'max_allocated': torch.cuda.max_memory_allocated(),
                    'memory_usage': len(self.memory) / self.config['memory_size'],
                    'batch_size': self.batch_size
                }
            return {
                'memory_usage': len(self.memory) / self.config['memory_size'],
                'batch_size': self.batch_size
            }
        except Exception as e:
            self.logger.error(f"Error getting memory stats: {e}")
            return {}
            
    def save_state(self, path: str = "checkpoints") -> None:
        """Sauvegarde l'état complet du learner"""
        try:
            os.makedirs(path, exist_ok=True)
            
            # Sauvegarde chaque modèle
            for name, model in self.models.items():
                checkpoint = {
                    'model_state': model.state_dict(),
                    'optimizer_state': self.optimizers[name].state_dict(),
                    'scheduler_state': self.schedulers[name].state_dict(),
                    'config': self.config,
                    'stats': self.stats,
                    'timestamp': datetime.now().isoformat()
                }
                
                checkpoint_path = os.path.join(path, f"{name}_latest.pt")
                torch.save(checkpoint, checkpoint_path)
                
            self.logger.info("State saved successfully")
            
        except Exception as e:
            self.logger.error(f"Error saving state: {e}")
            
    def load_state(self, path: str = "checkpoints") -> bool:
        """Charge l'état complet du learner"""
        try:
            success = True
            for name in self.models.keys():
                checkpoint_path = os.path.join(path, f"{name}_latest.pt")
                
                if os.path.exists(checkpoint_path):
                    checkpoint = torch.load(checkpoint_path, map_location=self.device)
                    
                    self.models[name].load_state_dict(checkpoint['model_state'])
                    self.optimizers[name].load_state_dict(checkpoint['optimizer_state'])
                    self.schedulers[name].load_state_dict(checkpoint['scheduler_state'])
                    
                    # Mise à jour des stats
                    self.stats.update(checkpoint['stats'])
                else:
                    success = False
                    self.logger.warning(f"No checkpoint found for {name}")
                    
            return success
            
        except Exception as e:
            self.logger.error(f"Error loading state: {e}")
            return False 

    def _handle_auto_backup(self):
        """Gère les backups automatiques"""
        if datetime.now() - self.last_backup > self.backup_frequency:
            state = self._prepare_state_for_backup()
            if self.backup_manager.create_backup(state, "auto"):
                self.last_backup = datetime.now()
                
    def _handle_emergency_backup(self):
        """Crée un backup d'urgence en cas d'erreur"""
        state = self._prepare_state_for_backup()
        self.backup_manager.create_backup(state, "emergency")
        
    def _prepare_state_for_backup(self) -> Dict[str, Any]:
        """Prépare l'état complet pour le backup"""
        return {
            'models': {name: model.state_dict() for name, model in self.models.items()},
            'optimizers': {name: opt.state_dict() for name, opt in self.optimizers.items()},
            'schedulers': {name: sched.state_dict() for name, sched in self.schedulers.items()},
            'config': self.config,
            'stats': self.stats,
            'memory': list(self.memory),
            'version': '1.0.0', 
            'timestamp': datetime.now().isoformat()
        } 