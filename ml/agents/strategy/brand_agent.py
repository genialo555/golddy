from .base_agent import BaseAgent
import torch
from transformers import AutoModelForSequenceClassification, AutoTokenizer
import numpy as np
from typing import Dict, Any

class AgentMarque(BaseAgent):
    def __init__(self):
        super().__init__("agent_marque")
        self.modele = AutoModelForSequenceClassification.from_pretrained(
            'distilbert-base-uncased',
            num_labels=3  # affinite_marque, neutre, incompatibilite_marque
        ).to(self.device)
        self.tokenizer = AutoTokenizer.from_pretrained('distilbert-base-uncased')
        
    def analyser(self, donnees: Dict[str, Any]) -> Dict[str, Any]:
        """Analyse l'affinité avec les marques"""
        try:
            # Vérifie et récupère les données manquantes
            if not self._verifier_donnees_requises(donnees):
                donnees = self._recuperer_donnees_manquantes(donnees)
            
            # Analyse le contenu
            analyse_marque = self._analyser_affinite_marque(donnees)
            
            # Découvre des patterns
            self.decouvrir_patterns_api(donnees)
            
            return {
                'metriques_marque': analyse_marque,
                'marques_decouvertes': self._extraire_mentions_marque(donnees),
                'recommandations': self._generer_recommandations_marque(analyse_marque)
            }
            
        except Exception as e:
            self.logger.error(f"Erreur dans l'analyse de marque: {str(e)}")
            return {'erreur': str(e)}
    
    def _analyser_affinite_marque(self, donnees: Dict[str, Any]) -> Dict[str, float]:
        """Analyse l'affinité avec les marques"""
        with torch.no_grad():
            texte = f"{donnees.get('legende', '')} {' '.join(donnees.get('hashtags', []))}"
            
            entrees = self.tokenizer(
                texte,
                truncation=True,
                padding='max_length',
                max_length=128,
                return_tensors='pt'
            ).to(self.device)
            
            sorties = self.modele(**entrees)
            scores = torch.softmax(sorties.logits, dim=1)
            
            return {
                'score_affinite_marque': scores[0][0].item(),
                'qualite_correspondance_marque': self._calculer_correspondance_marque(donnees),
                'potentiel_collaboration': self._calculer_potentiel_collaboration(donnees)
            }

    def _verifier_donnees_requises(self, donnees: Dict[str, Any]) -> bool:
        """Vérifie si toutes les données requises sont présentes"""
        champs_requis = ['legende', 'hashtags', 'engagement', 'audience']
        return all(champ in donnees for champ in champs_requis)

    def _recuperer_donnees_manquantes(self, donnees: Dict[str, Any]) -> Dict[str, Any]:
        """Récupère les données manquantes nécessaires à l'analyse"""
        donnees_completes = donnees.copy()
        
        if 'legende' not in donnees_completes:
            donnees_completes['legende'] = self._extraire_legende(donnees_completes)
            
        if 'hashtags' not in donnees_completes:
            donnees_completes['hashtags'] = self._extraire_hashtags(donnees_completes)
            
        if 'engagement' not in donnees_completes:
            donnees_completes['engagement'] = self._calculer_metriques_engagement(donnees_completes)
            
        if 'audience' not in donnees_completes:
            donnees_completes['audience'] = self._analyser_audience(donnees_completes)
            
        return donnees_completes

    def _calculer_correspondance_marque(self, donnees: Dict[str, Any]) -> float:
        """Calcule la qualité de correspondance avec la marque"""
        try:
            # Analyse des valeurs de la marque
            valeurs_marque = self._analyser_valeurs_marque(donnees)
            
            # Analyse de l'alignement du contenu
            alignement_contenu = self._evaluer_alignement_contenu(donnees)
            
            # Analyse de l'audience
            correspondance_audience = self._evaluer_correspondance_audience(donnees)
            
            # Combine les scores avec pondération
            score_final = (
                valeurs_marque * 0.4 +
                alignement_contenu * 0.3 +
                correspondance_audience * 0.3
            )
            
            return min(max(score_final, 0.0), 1.0)
            
        except Exception as e:
            self.logger.error(f"Erreur de calcul de correspondance: {str(e)}")
            return 0.0

    def _calculer_potentiel_collaboration(self, donnees: Dict[str, Any]) -> float:
        """Évalue le potentiel de collaboration avec la marque"""
        try:
            # Analyse de l'engagement
            score_engagement = self._evaluer_metriques_engagement(donnees)
            
            # Analyse de la croissance
            score_croissance = self._evaluer_tendance_croissance(donnees)
            
            # Analyse de la qualité du contenu
            score_qualite = self._evaluer_qualite_contenu(donnees)
            
            # Combine les scores
            return (score_engagement * 0.4 + 
                   score_croissance * 0.3 + 
                   score_qualite * 0.3)
                   
        except Exception as e:
            self.logger.error(f"Erreur de calcul du potentiel: {str(e)}")
            return 0.0 