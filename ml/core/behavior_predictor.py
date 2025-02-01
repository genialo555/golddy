from typing import Dict, Any, List
import numpy as np
import torch
import torch.nn as nn
from transformers import AutoModel
import logging
from datetime import datetime, timedelta

class BehaviorPredictor:
    def __init__(self):
        self.logger = logging.getLogger('behavior_predictor')
        self.model = self._load_model()
        self.behavior_patterns = self._load_behavior_patterns()
        self.context_history = []
        
    def predict_behavior(self, page_type: str, context: Dict[str, Any]) -> Dict[str, Any]:
        """Prédit le comportement optimal pour le contexte"""
        try:
            # Analyse le contexte
            context_vector = self._encode_context(context)
            page_vector = self._encode_page_type(page_type)
            
            # Prédit le comportement
            with torch.no_grad():
                prediction = self.model(
                    context_vector.unsqueeze(0),
                    page_vector.unsqueeze(0)
                )
                
            # Génère le pattern de comportement
            behavior_pattern = self._generate_behavior_pattern(
                prediction,
                context,
                page_type
            )
            
            # Valide le pattern
            if self._validate_pattern(behavior_pattern):
                return behavior_pattern
            else:
                return self._get_fallback_pattern(context)
                
        except Exception as e:
            self.logger.error(f"Behavior prediction error: {str(e)}")
            return self._get_safe_pattern()
            
    def _generate_behavior_pattern(self, prediction: torch.Tensor, 
                                 context: Dict[str, Any],
                                 page_type: str) -> Dict[str, Any]:
        """Génère un pattern de comportement détaillé"""
        pattern_id = prediction.argmax().item()
        base_pattern = self.behavior_patterns[pattern_id].copy()
        
        # Adapte le pattern au contexte
        adapted_pattern = {
            'type': page_type,
            'actions': self._adapt_actions(base_pattern['actions'], context),
            'timing': self._generate_timing_pattern(context),
            'movement': self._generate_movement_pattern(context),
            'interaction': self._generate_interaction_pattern(context),
            'fallback': self._get_fallback_actions(context)
        }
        
        return adapted_pattern
        
    def _adapt_actions(self, actions: List[Dict], context: Dict[str, Any]) -> List[Dict]:
        """Adapte les actions au contexte"""
        adapted = []
        last_action_time = datetime.now()
        
        for action in actions:
            # Ajoute de la variabilité naturelle
            delay = self._calculate_natural_delay(
                action['type'],
                last_action_time,
                context
            )
            
            adapted_action = {
                'type': action['type'],
                'params': self._adapt_action_params(action['params'], context),
                'delay': delay,
                'optional': action.get('optional', False),
                'fallback': self._get_action_fallback(action)
            }
            
            adapted.append(adapted_action)
            last_action_time += timedelta(seconds=delay)
            
        return adapted
        
    def _generate_timing_pattern(self, context: Dict[str, Any]) -> Dict[str, Any]:
        """Génère des patterns temporels naturels"""
        base_delay = np.random.normal(2, 0.5)  # Moyenne de 2s, écart-type de 0.5s
        
        return {
            'base_delay': max(0.5, base_delay),  # Minimum 0.5s
            'read_time': self._calculate_read_time(context),
            'interaction_delay': self._calculate_interaction_delay(context),
            'transition_time': self._calculate_transition_time(context)
        }
        
    def _generate_movement_pattern(self, context: Dict[str, Any]) -> Dict[str, Any]:
        """Génère des patterns de mouvement naturels"""
        return {
            'scroll_pattern': self._get_scroll_pattern(context),
            'mouse_movement': self._get_mouse_pattern(context),
            'click_pattern': self._get_click_pattern(context)
        }

    def _load_model(self):
        """Charge le modèle de prédiction"""
        try:
            model = AutoModel.from_pretrained('models/behavior_predictor')
            model.eval()  # Mode évaluation
            return model.to('cuda' if torch.cuda.is_available() else 'cpu')
        except Exception as e:
            self.logger.error(f"Model loading error: {str(e)}")
            return self._load_fallback_model()

    def _encode_context(self, context: Dict[str, Any]) -> torch.Tensor:
        """Encode le contexte en vecteur"""
        features = []
        
        # Encode les différentes caractéristiques du contexte
        features.extend(self._encode_time_features(context))
        features.extend(self._encode_user_features(context))
        features.extend(self._encode_session_features(context))
        features.extend(self._encode_risk_features(context))
        
        return torch.tensor(features, dtype=torch.float32)

    def _get_scroll_pattern(self, context: Dict[str, Any]) -> Dict[str, Any]:
        """Génère un pattern de défilement naturel"""
        content_length = context.get('content_length', 1000)
        reading_speed = self._estimate_reading_speed(context)
        
        return {
            'initial_delay': np.random.normal(2, 0.5),
            'scroll_speed': self._calculate_scroll_speed(content_length, reading_speed),
            'pause_points': self._generate_pause_points(content_length),
            'micro_movements': self._generate_micro_movements()
        } 