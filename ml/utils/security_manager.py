from typing import Dict, Any, Optional
import logging
import torch
import numpy as np
from datetime import datetime
import hashlib
import json
from pathlib import Path

class SecurityManager:
    def __init__(self):
        self.logger = logging.getLogger('security_manager')
        self.anomaly_thresholds = self._load_security_config()
        self.incident_history = []
        self.threat_levels = {
            'low': 0.3,
            'medium': 0.6,
            'high': 0.8,
            'critical': 0.95
        }
        
    def validate_input(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Valide et sécurise les données d'entrée"""
        try:
            # Vérification de base
            if not self._check_data_structure(data):
                raise ValueError("Invalid data structure")
                
            # Nettoyage et normalisation
            cleaned_data = self._sanitize_data(data)
            
            # Détection d'anomalies
            anomalies = self._detect_anomalies(cleaned_data)
            if anomalies['threat_level'] >= self.threat_levels['critical']:
                self._handle_critical_threat(anomalies)
                return None
                
            # Validation des valeurs
            if not self._validate_values(cleaned_data):
                raise ValueError("Invalid values detected")
                
            return cleaned_data
            
        except Exception as e:
            self._log_security_incident({
                'type': 'input_validation_failure',
                'error': str(e),
                'timestamp': datetime.now().isoformat()
            })
            return None
            
    def monitor_execution(self, func):
        """Décorateur pour surveiller l'exécution"""
        def wrapper(*args, **kwargs):
            start_time = datetime.now()
            resource_usage_start = self._get_resource_usage()
            
            try:
                # Vérifie les conditions avant exécution
                if not self._check_execution_safety():
                    raise SecurityException("Unsafe execution conditions")
                    
                result = func(*args, **kwargs)
                
                # Vérifie les résultats
                if not self._validate_output(result):
                    raise SecurityException("Invalid output detected")
                    
                return result
                
            except Exception as e:
                self._handle_execution_error(e, {
                    'function': func.__name__,
                    'args': args,
                    'kwargs': kwargs
                })
                raise
                
            finally:
                # Analyse de l'exécution
                execution_time = datetime.now() - start_time
                resource_usage_end = self._get_resource_usage()
                self._analyze_execution_metrics(
                    execution_time,
                    resource_usage_start,
                    resource_usage_end
                )
                
        return wrapper
        
    def _detect_anomalies(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Détecte les anomalies dans les données"""
        anomalies = {
            'statistical_anomalies': self._check_statistical_anomalies(data),
            'pattern_anomalies': self._check_pattern_anomalies(data),
            'behavioral_anomalies': self._check_behavioral_anomalies(data)
        }
        
        # Calcul du niveau de menace
        threat_level = self._calculate_threat_level(anomalies)
        
        return {
            'anomalies': anomalies,
            'threat_level': threat_level,
            'timestamp': datetime.now().isoformat()
        }
        
    def _check_execution_safety(self) -> bool:
        """Vérifie les conditions de sécurité pour l'exécution"""
        try:
            # Vérifie la mémoire disponible
            if torch.cuda.is_available():
                memory_usage = torch.cuda.memory_allocated() / torch.cuda.max_memory_allocated()
                if memory_usage > 0.95:  # 95% utilisé
                    return False
                    
            # Vérifie la charge système
            system_load = self._get_system_load()
            if system_load > 0.9:  # 90% utilisé
                return False
                
            # Vérifie l'historique des incidents
            recent_incidents = self._get_recent_incidents(minutes=5)
            if len(recent_incidents) > 3:  # Plus de 3 incidents en 5 minutes
                return False
                
            return True
            
        except Exception as e:
            self.logger.error(f"Safety check error: {e}")
            return False
            
    def _handle_critical_threat(self, threat_info: Dict[str, Any]):
        """Gère une menace critique"""
        try:
            # Log l'incident
            self._log_security_incident({
                'type': 'critical_threat',
                'info': threat_info,
                'timestamp': datetime.now().isoformat()
            })
            
            # Mesures d'urgence
            self._emergency_shutdown()
            self._notify_administrators(threat_info)
            self._isolate_affected_components(threat_info)
            
        except Exception as e:
            self.logger.critical(f"Critical threat handling failed: {e}") 