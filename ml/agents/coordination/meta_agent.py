from typing import Dict, List, Any, Optional
import torch
import json
import logging
from datetime import datetime
from pathlib import Path
from dataclasses import dataclass
import requests
import pandas as pd

# Import des agents depuis leurs nouveaux emplacements
from ..base.base_agent import BaseAgent
from .strategy_coordinator import StrategyCoordinator
from ..analysis.fraud_detection_agent import FraudDetectionAgent

@dataclass
class InteractionUtilisateur:
    horodatage: datetime
    type_requete: str
    contexte: Dict[str, Any]
    retour: Optional[Dict[str, Any]] = None
    taux_succes: float = 0.0

class AgentMeta:
    def __init__(self, chemin_modele: str = "models/meta_agent"):
        self.logger = logging.getLogger("agent_meta")
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        self.historique_interactions = []
        self.base_connaissances = self._charger_base_connaissances()
        self.coordinateur = None
        self.chemin_memoire = Path("data/meta_agent_memory")
        self.chemin_memoire.mkdir(parents=True, exist_ok=True)
        self.donnees_scraper = {}
        self.client_ollama = self._initialiser_ollama()
        self.detecteur_fraude = FraudDetectionAgent()
        
    def initialiser_equipe(self, agents: List[BaseAgent]):
        """Initialise l'équipe d'agents et le coordinateur"""
        self.coordinateur = StrategyCoordinator(agents)
        self.agents = {
            agent.__class__.__name__: agent 
            for agent in agents
        }
        
    def traiter_requete(self, requete: Dict[str, Any]) -> Dict[str, Any]:
        """Traite une nouvelle requête utilisateur"""
        try:
            # Vérifie d'abord la qualité des données
            analyse_fraude = self.detecteur_fraude.analyser(requete)
            
            if analyse_fraude['score_risque'] > 0.7:
                self.logger.warning("Risque élevé de fraude détecté")
                return self._gerer_donnees_haut_risque(requete, analyse_fraude)
                
            # Ajuste la requête en fonction de l'analyse de fraude
            requete_nettoyee = self._nettoyer_donnees_requete(requete, analyse_fraude)
            
            # Enregistre l'interaction
            interaction = InteractionUtilisateur(
                horodatage=datetime.now(),
                type_requete=requete_nettoyee.get('type', 'inconnu'),
                contexte=self._extraire_contexte(requete_nettoyee)
            )
            
            # Analyse le contexte et l'historique
            requete_enrichie = self._enrichir_requete(requete_nettoyee, interaction)
            
            # Vérifie la cohérence avec l'historique
            self._valider_coherence_requete(requete_enrichie)
            
            # Coordonne les agents pour la réponse
            strategie = self.coordinateur.coordonner_strategie(requete_enrichie)
            
            # Vérifie les hallucinations potentielles
            strategie_validee = self._valider_strategie(strategie)
            
            # Met à jour la base de connaissances
            self._mettre_a_jour_base_connaissances(interaction, strategie_validee)
            
            return self._formater_reponse(strategie_validee)
            
        except Exception as e:
            self.logger.error(f"Erreur de traitement de la requête: {str(e)}")
            return {'erreur': str(e)}
    
    def _extraire_contexte(self, requete: Dict[str, Any]) -> Dict[str, Any]:
        """Extrait le contexte pertinent de la requête"""
        return {
            'horodatage': datetime.now().isoformat(),
            'type_requete': requete.get('type'),
            'contexte_influenceur': requete.get('donnees_influenceur', {}),
            'strategies_precedentes': self._obtenir_historique_pertinent(requete),
            'conditions_marche': requete.get('donnees_marche', {}),
            'metriques_performance': requete.get('metriques', {})
        }
    
    def _enrichir_requete(self, requete: Dict[str, Any], interaction: InteractionUtilisateur) -> Dict[str, Any]:
        """Enrichit la requête avec des informations historiques et contextuelles"""
        enrichie = requete.copy()
        
        # Ajoute le contexte historique
        contexte_historique = self._analyser_patterns_historiques(interaction)
        enrichie['contexte_historique'] = contexte_historique
        
        # Ajoute les insights précédents
        insights_precedents = self._obtenir_insights_pertinents(requete)
        enrichie['insights_precedents'] = insights_precedents
        
        # Ajoute les contraintes apprises
        contraintes_apprises = self._obtenir_contraintes_apprises(requete)
        enrichie['contraintes'] = contraintes_apprises
        
        return enrichie
    
    def _valider_strategie(self, strategie: Dict[str, Any]) -> Dict[str, Any]:
        """Vérifie et corrige les potentielles hallucinations dans la stratégie"""
        validee = strategie.copy()
        
        # Vérifie la cohérence avec l'historique
        validee = self._verifier_coherence_historique(validee)
        
        # Vérifie la faisabilité des propositions
        validee = self._verifier_faisabilite(validee)
        
        # Vérifie la cohérence interne
        validee = self._verifier_coherence_interne(validee)
        
        # Ajoute des notes de confiance
        validee['scores_confiance'] = self._calculer_scores_confiance(validee)
        
        return validee
    
    def _verifier_coherence_historique(self, strategie: Dict[str, Any]) -> Dict[str, Any]:
        """Vérifie la cohérence avec l'historique des interactions"""
        for key, value in strategie.items():
            if isinstance(value, dict):
                historical_data = self._get_historical_data(key)
                if historical_data:
                    confidence = self._calculate_historical_confidence(value, historical_data)
                    if confidence < 0.5:
                        self.logger.warning(f"Low confidence in {key}: {confidence}")
                        strategie[key] = self._adjust_based_on_history(value, historical_data)
        return strategie
    
    def _calculer_scores_confiance(self, strategie: Dict[str, Any]) -> Dict[str, float]:
        """Calcule les scores de confiance pour chaque élément de la stratégie"""
        scores = {}
        for key, value in strategie.items():
            if key not in ['scores_confiance', 'metadata']:
                scores[key] = self._calculate_element_confidence(key, value)
        return scores
    
    def _calculate_element_confidence(self, key: str, value: Any) -> float:
        """Calcule le score de confiance pour un élément spécifique"""
        historical_confidence = self._get_historical_confidence(key)
        data_confidence = self._get_data_confidence(value)
        agent_confidence = self._get_agent_confidence(key)
        
        # Pondération des différents facteurs
        weights = {
            'historical': 0.4,
            'data': 0.3,
            'agent': 0.3
        }
        
        return (
            historical_confidence * weights['historical'] +
            data_confidence * weights['data'] +
            agent_confidence * weights['agent']
        )
    
    def _mettre_a_jour_base_connaissances(self, interaction: InteractionUtilisateur, strategie: Dict[str, Any]):
        """Met à jour la base de connaissances avec les nouvelles informations"""
        # Sauvegarde l'interaction
        self.historique_interactions.append(interaction)
        
        # Met à jour les patterns appris
        self._update_learned_patterns(interaction, strategie)
        
        # Sauvegarde la mémoire
        self._save_memory()
    
    def _save_memory(self):
        """Sauvegarde l'état de la mémoire"""
        memory_file = self.chemin_memoire / f"memory_{datetime.now().strftime('%Y%m%d')}.json"
        with open(memory_file, 'w') as f:
            json.dump({
                'historique_interactions': [vars(i) for i in self.historique_interactions],
                'base_connaissances': self.base_connaissances
            }, f, indent=2)
    
    def _initialiser_ollama(self):
        """Initialise la connexion avec Ollama"""
        return {
            'url': 'http://localhost:11434/api/generate',
            'model': 'llama2'
        }
        
    def _charger_base_connaissances(self) -> Dict[str, Any]:
        """Charge la base de connaissances initiale"""
        try:
            # Charge les données du scraper
            self.donnees_scraper = self._load_scraper_data()
            
            # Structure initiale de la base de connaissances
            return {
                'patterns': {
                    'engagement': self._extract_engagement_patterns(),
                    'content': self._extract_content_patterns(),
                    'growth': self._extract_growth_patterns()
                },
                'benchmarks': self._calculate_benchmarks(),
                'market_insights': self._analyze_market_trends(),
                'success_metrics': self._define_success_metrics()
            }
        except Exception as e:
            self.logger.error(f"Error loading knowledge base: {str(e)}")
            return {}
            
    def _load_scraper_data(self) -> Dict[str, Any]:
        """Charge les données collectées par le scraper"""
        try:
            data = {
                'posts': pd.read_csv('data/raw_instagram_data.csv'),
                'metrics': pd.read_csv('data/processed_features.csv')
            }
            return self._preprocess_scraper_data(data)
        except Exception as e:
            self.logger.warning(f"Could not load scraper data: {str(e)}")
            return {}
            
    def _valider_coherence_requete(self, requete: Dict[str, Any]):
        """Valide la cohérence de la requête avec les données réelles"""
        try:
            # Vérifie avec Ollama
            validation_prompt = self._create_validation_prompt(requete)
            validation_result = self._query_ollama(validation_prompt)
            
            if not self._is_request_valid(validation_result):
                raise ValueError("Request validation failed")
                
        except Exception as e:
            self.logger.error(f"Request validation error: {str(e)}")
            raise
            
    def _query_ollama(self, prompt: str) -> Dict[str, Any]:
        """Interroge Ollama pour validation et insights"""
        try:
            response = requests.post(
                self.client_ollama['url'],
                json={
                    'model': self.client_ollama['model'],
                    'prompt': prompt,
                    'stream': False,
                    'options': {
                        'temperature': 0.3,  # Plus conservateur pour la validation
                        'top_p': 0.9
                    }
                }
            )
            return self._parse_ollama_response(response.json())
        except Exception as e:
            self.logger.error(f"Ollama query failed: {str(e)}")
            return {}
            
    def _verifier_faisabilite(self, strategie: Dict[str, Any]) -> Dict[str, Any]:
        """Vérifie la faisabilité basée sur les données réelles"""
        validee = strategie.copy()
        
        # Vérifie avec les données du scraper
        for key, value in validee.items():
            if key in self.donnees_scraper:
                feasibility_score = self._calculate_feasibility(
                    value,
                    self.donnees_scraper[key]
                )
                if feasibility_score < 0.6:
                    validee[key] = self._adjust_to_realistic_values(
                        value,
                        self.donnees_scraper[key]
                    )
                    
        # Double vérification avec Ollama
        feasibility_prompt = self._create_feasibility_prompt(validee)
        ollama_validation = self._query_ollama(feasibility_prompt)
        
        if ollama_validation.get('feasibility_score', 1.0) < 0.7:
            self.logger.warning("Strategy adjusted based on feasibility check")
            validee = self._adjust_strategy_feasibility(validee, ollama_validation)
            
        return validee
        
    def _verifier_coherence_interne(self, strategie: Dict[str, Any]) -> Dict[str, Any]:
        """Vérifie la cohérence interne de la stratégie"""
        # Vérifie les contradictions
        conflicts = self._find_strategy_conflicts(strategie)
        if conflicts:
            strategie = self._resolve_conflicts(strategie, conflicts)
            
        # Vérifie la temporalité
        strategie = self._validate_timeline_consistency(strategie)
        
        # Vérifie l'alignement des objectifs
        strategie = self._validate_goal_alignment(strategie)
        
        return strategie
        
    def _formater_reponse(self, strategie: Dict[str, Any]) -> Dict[str, Any]:
        """Formate la réponse finale avec contexte et explications"""
        return {
            'strategie': strategie,
            'context': {
                'data_sources': self._get_data_sources(),
                'confidence_metrics': self._get_confidence_metrics(strategie),
                'validation_steps': self._get_validation_steps()
            },
            'explanations': self._generate_strategy_explanations(strategie),
            'next_steps': self._suggest_next_steps(strategie),
            'monitoring_plan': self._create_monitoring_plan(strategie)
        }
    
    def _nettoyer_donnees_requete(self, requete: Dict[str, Any], fraud_analysis: Dict[str, Any]) -> Dict[str, Any]:
        """Nettoie les données en fonction de l'analyse de fraude"""
        nettoyee = requete.copy()
        
        # Retire les données suspectes
        if fraud_analysis.get('fraud_metrics'):
            metrics = fraud_analysis['fraud_metrics']
            
            # Filtre les engagements suspects
            if metrics['engagement_manipulation']['anomaly_scores'].get('like_velocity', 0) > 0.8:
                nettoyee = self._adjust_engagement_metrics(nettoyee)
                
            # Filtre les interactions de bots
            if metrics['bot_presence']['bot_probability'] > 0.7:
                nettoyee = self._filter_bot_interactions(nettoyee)
                
            # Ajuste les métriques de croissance
            if metrics['temporal_anomalies']['growth_anomalies']['score'] > 0.6:
                nettoyee = self._normalize_growth_metrics(nettoyee)
                
        return nettoyee
    
    def _gerer_donnees_haut_risque(self, requete: Dict[str, Any], fraud_analysis: Dict[str, Any]) -> Dict[str, Any]:
        """Gère les cas de données à haut risque"""
        return {
            'status': 'high_risk',
            'fraud_analysis': fraud_analysis,
            'recommendations': self._generate_fraud_handling_recommendations(fraud_analysis),
            'clean_data_required': True,
            'risk_mitigation_steps': self._suggest_risk_mitigation_steps(fraud_analysis)
        } 