from .base_agent import BaseAgent
import torch
import torch.nn as nn
from typing import Dict, Any, List
import numpy as np
from sklearn.ensemble import IsolationForest
from datetime import datetime, timedelta

class AgentDetectionFraude(BaseAgent):
    def __init__(self):
        super().__init__("agent_detection_fraude")
        self.detecteur_anomalies = IsolationForest(contamination=0.1)
        self.patterns_engagement = {}
        self.patterns_bots = self._charger_patterns_bots()
        
        # Messages d'erreur en français
        self.error_messages.update({
            'detection_error': "Erreur lors de la détection: {}",
            'analyse_error': "Erreur lors de l'analyse: {}",
            'calcul_error': "Erreur de calcul: {}"
        })
        
    def analyser(self, donnees: Dict[str, Any]) -> Dict[str, Any]:
        """Analyse les données pour détecter les fraudes"""
        try:
            # Analyse multi-niveaux
            fraude_engagement = self._detecter_fraude_engagement(donnees)
            activite_bots = self._detecter_activite_bots(donnees)
            comptes_suspects = self._identifier_comptes_suspects(donnees)
            anomalies_temporelles = self._detecter_anomalies_temporelles(donnees)
            
            return {
                'metriques_fraude': {
                    'manipulation_engagement': fraude_engagement,
                    'presence_bots': activite_bots,
                    'comptes_suspects': comptes_suspects,
                    'anomalies_temporelles': anomalies_temporelles
                },
                'score_risque': self._calculer_score_risque(
                    fraude_engagement,
                    activite_bots,
                    comptes_suspects,
                    anomalies_temporelles
                ),
                'recommandations': self._generer_recommandations_fraude()
            }
        except Exception as e:
            self.logger.error(f"Erreur de détection de fraude: {str(e)}")
            return {'erreur': str(e)}
    
    def _detecter_fraude_engagement(self, donnees: Dict[str, Any]) -> Dict[str, float]:
        """Détecte les patterns de fraude dans l'engagement"""
        try:
            metriques = self._extraire_metriques_engagement(donnees)
            anomalies = self.detecteur_anomalies.fit_predict(metriques)
            return self._calculer_scores_fraude(anomalies, metriques)
        except Exception as e:
            self.logger.error(f"Erreur lors de la détection de fraude d'engagement: {str(e)}")
            return {}
    
    def _detecter_activite_bots(self, donnees: Dict[str, Any]) -> Dict[str, Any]:
        """Détecte l'activité suspecte de bots"""
        try:
            commentaires = self._analyser_commentaires_bots(donnees)
            interactions = self._analyser_patterns_interaction(donnees)
            return {
                'score_bot': self._calculer_score_bot(commentaires, interactions),
                'details': {
                    'commentaires_suspects': commentaires,
                    'patterns_interaction': interactions
                }
            }
        except Exception as e:
            self.logger.error(f"Erreur lors de la détection d'activité de bots: {str(e)}")
            return {}
    
    def _identifier_comptes_suspects(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Identifie les faux comptes"""
        account_metrics = {
            'profile_completeness': self._calculate_profile_completeness(data),
            'activity_consistency': self._analyze_activity_consistency(data),
            'content_authenticity': self._analyze_content_authenticity(data),
            'social_graph': self._analyze_social_connections(data)
        }
        
        return {
            'fake_probability': self._calculate_fake_probability(account_metrics),
            'suspicious_accounts': self._identify_suspicious_accounts(account_metrics)
        }
    
    def _detecter_anomalies_temporelles(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Détecte les anomalies temporelles"""
        time_series = self._prepare_time_series(data)
        
        return {
            'growth_anomalies': self._detect_growth_anomalies(time_series),
            'engagement_spikes': self._detect_engagement_spikes(time_series),
            'periodic_patterns': self._analyze_periodic_patterns(time_series)
        }
    
    def _calculer_score_risque(self, *fraud_components) -> float:
        """Calcule un score de risque global"""
        weights = {
            'engagement': 0.3,
            'bots': 0.3,
            'fake_accounts': 0.2,
            'temporal': 0.2
        }
        
        scores = []
        for component, weight in zip(fraud_components, weights.values()):
            score = self._component_risk_score(component)
            scores.append(score * weight)
            
        return sum(scores)
    
    def _analyser_commentaires_bots(self, donnees: Dict[str, Any]) -> Dict[str, float]:
        """Analyse les commentaires pour détecter les bots"""
        commentaires = donnees.get('commentaires', [])
        
        return {
            'probabilite_spam': self._detecter_patterns_spam(commentaires),
            'score_repetition': self._calculer_score_repetition(commentaires),
            'analyse_temporelle': self._analyser_timing_commentaires(commentaires),
            'authenticite_langage': self._analyser_patterns_langage(commentaires)
        }
    
    def _analyser_patterns_interaction(self, donnees: Dict[str, Any]) -> Dict[str, float]:
        """Analyse les patterns d'interaction pour détecter les bots"""
        interactions = donnees.get('interactions', [])
        
        patterns = {
            'timing': self._analyser_patterns_timing(interactions),
            'frequence': self._analyser_frequence_interaction(interactions),
            'diversite': self._analyser_diversite_interaction(interactions)
        }
        
        return {
            'probabilite_bot': self._calculer_probabilite_bot(patterns),
            'patterns_suspects': self._identifier_patterns_bot(patterns)
        }

    def _calculer_completude_profil(self, donnees: Dict[str, Any]) -> float:
        """Calcule le score de complétude du profil"""
        champs_requis = ['bio', 'photo_profil', 'posts', 'abonnes', 'abonnements']
        score = sum(1 for champ in champs_requis if donnees.get(champ))
        return score / len(champs_requis)

    def _analyser_coherence_activite(self, donnees: Dict[str, Any]) -> Dict[str, float]:
        """Analyse la cohérence de l'activité du compte"""
        try:
            activite = donnees.get('activite', {})
            return {
                'coherence_temporelle': self._verifier_coherence_temporelle(activite),
                'coherence_engagement': self._verifier_coherence_engagement(activite),
                'coherence_contenu': self._verifier_coherence_contenu(activite)
            }
        except Exception as e:
            self.logger.error(f"Erreur d'analyse de cohérence: {str(e)}")
            return {}

    def _analyser_authenticite_contenu(self, donnees: Dict[str, Any]) -> Dict[str, float]:
        """Analyse l'authenticité du contenu"""
        try:
            contenu = donnees.get('contenu', {})
            return {
                'originalite': self._evaluer_originalite(contenu),
                'qualite': self._evaluer_qualite_contenu(contenu),
                'coherence_style': self._evaluer_coherence_style(contenu)
            }
        except Exception as e:
            self.logger.error(f"Erreur d'analyse d'authenticité: {str(e)}")
            return {}

    def _analyser_connexions_sociales(self, donnees: Dict[str, Any]) -> Dict[str, float]:
        """Analyse les connexions sociales du compte"""
        try:
            connexions = donnees.get('connexions', {})
            return {
                'ratio_abonnes_abonnements': self._calculer_ratio_connexions(connexions),
                'qualite_interactions': self._evaluer_qualite_interactions(connexions),
                'diversite_reseau': self._evaluer_diversite_reseau(connexions)
            }
        except Exception as e:
            self.logger.error(f"Erreur d'analyse des connexions: {str(e)}")
            return {}

    def _calculer_probabilite_faux(self, metriques: Dict[str, Any]) -> float:
        """Calcule la probabilité qu'un compte soit faux"""
        try:
            poids = {
                'completude_profil': 0.2,
                'coherence_activite': 0.3,
                'authenticite_contenu': 0.3,
                'connexions_sociales': 0.2
            }
            
            score = sum(
                metriques.get(metrique, 0) * poids[metrique]
                for metrique in poids
            )
            
            return min(max(score, 0.0), 1.0)
            
        except Exception as e:
            self.logger.error(f"Erreur de calcul de probabilité: {str(e)}")
            return 0.0

    def _identifier_comptes_suspects(self, metriques: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Identifie les comptes suspects basé sur les métriques"""
        try:
            comptes_suspects = []
            seuil_suspicion = 0.7
            
            for compte, metriques_compte in metriques.items():
                probabilite = self._calculer_probabilite_faux(metriques_compte)
                if probabilite > seuil_suspicion:
                    comptes_suspects.append({
                        'compte': compte,
                        'probabilite': probabilite,
                        'raisons': self._identifier_raisons_suspicion(metriques_compte)
                    })
                    
            return comptes_suspects
            
        except Exception as e:
            self.logger.error(f"Erreur d'identification des comptes suspects: {str(e)}")
            return []

    def _analyze_bot_comments(self, data: Dict[str, Any]) -> Dict[str, float]:
        """Analyse les commentaires pour détecter les bots"""
        comments = data.get('comments', [])
        
        return {
            'spam_probability': self._detect_spam_patterns(comments),
            'repetition_score': self._calculate_repetition_score(comments),
            'timing_analysis': self._analyze_comment_timing(comments),
            'language_authenticity': self._analyze_language_patterns(comments)
        }
    
    def _analyze_interaction_patterns(self, data: Dict[str, Any]) -> Dict[str, float]:
        """Analyse les patterns d'interaction pour détecter les bots"""
        interactions = data.get('interactions', [])
        
        patterns = {
            'timing': self._analyze_timing_patterns(interactions),
            'frequency': self._analyze_interaction_frequency(interactions),
            'diversity': self._analyze_interaction_diversity(interactions)
        }
        
        return {
            'bot_probability': self._calculate_bot_probability(patterns),
            'suspicious_patterns': self._identify_bot_patterns(patterns)
        } 