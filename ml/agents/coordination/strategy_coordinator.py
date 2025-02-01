from typing import List, Dict, Any
import torch
import json
from dataclasses import dataclass
import logging

# Import des agents depuis leurs nouveaux emplacements
from ..base.base_agent import BaseAgent

@dataclass
class PropositionStrategie:
    nom_agent: str
    confiance: float
    proposition: Dict[str, Any]
    priorite: int
    zones_impact: List[str]

class CoordinateurStrategie:
    def __init__(self, agents: List[BaseAgent]):
        self.agents = agents
        self.logger = logging.getLogger("coordinateur_strategie")
        self.historique_conversation = []
        self.seuil_consensus = 0.7
        
    def coordonner_strategie(self, donnees: Dict[str, Any]) -> Dict[str, Any]:
        """Coordonne le dialogue entre agents pour élaborer une stratégie"""
        
        # Phase 1: Analyse individuelle
        propositions = self._recueillir_propositions(donnees)
        
        # Phase 2: Débat et raffinement
        strategie_raffinee = self._conduire_debat_strategie(propositions)
        
        # Phase 3: Consensus et plan d'action
        strategie_finale = self._construire_consensus(strategie_raffinee)
        
        return strategie_finale
    
    def _recueillir_propositions(self, donnees: Dict[str, Any]) -> List[PropositionStrategie]:
        """Collecte les propositions initiales de chaque agent"""
        propositions = []
        
        for agent in self.agents:
            analyse = agent.analyser(donnees)
            proposition = PropositionStrategie(
                nom_agent=agent.__class__.__name__,
                confiance=self._calculer_confiance(analyse),
                proposition=analyse,
                priorite=self._determiner_priorite(analyse),
                zones_impact=self._identifier_zones_impact(analyse)
            )
            propositions.append(proposition)
            
        return propositions
    
    def _conduire_debat_strategie(self, propositions: List[PropositionStrategie]) -> Dict[str, Any]:
        """Simule un débat entre agents pour affiner la stratégie"""
        tours_debat = 3
        propositions_actuelles = propositions
        
        for tour in range(tours_debat):
            self.logger.info(f"Début du tour de débat {tour + 1}")
            
            # Chaque agent évalue et commente les propositions des autres
            propositions_raffinees = []
            for agent in self.agents:
                retour = self._obtenir_retour_agent(agent, propositions_actuelles)
                proposition_raffinee = self._raffiner_proposition(
                    agent, 
                    propositions_actuelles, 
                    retour
                )
                propositions_raffinees.append(proposition_raffinee)
                
            # Enregistre la conversation
            self.historique_conversation.append({
                'tour': tour + 1,
                'propositions': propositions_raffinees,
                'conflits': self._identifier_conflits(propositions_raffinees)
            })
            
            propositions_actuelles = propositions_raffinees
            
        return self._synthetiser_propositions(propositions_actuelles)
    
    def _obtenir_retour_agent(self, agent: BaseAgent, propositions: List[PropositionStrategie]) -> Dict[str, Any]:
        """Obtient le retour d'un agent sur les propositions des autres"""
        autres_propositions = [p for p in propositions if p.nom_agent != agent.__class__.__name__]
        retour = {}
        
        for proposition in autres_propositions:
            retour[proposition.nom_agent] = {
                'niveau_accord': self._calculer_accord(agent, proposition),
                'preoccupations': self._identifier_preoccupations(agent, proposition),
                'suggestions': self._generer_suggestions(agent, proposition)
            }
            
        return retour
    
    def _raffiner_proposition(self, agent: BaseAgent, propositions: List[PropositionStrategie], retour: Dict[str, Any]) -> PropositionStrategie:
        """Affine la proposition d'un agent basé sur le retour"""
        proposition_originale = next(p for p in propositions if p.nom_agent == agent.__class__.__name__)
        
        # Intègre le retour dans une nouvelle proposition
        proposition_raffinee = proposition_originale.proposition.copy()
        
        # Ajuste la stratégie basée sur le retour
        for retour_agent in retour.values():
            if retour_agent['niveau_accord'] > 0.6:
                proposition_raffinee = self._integrer_suggestions(
                    proposition_raffinee,
                    retour_agent['suggestions']
                )
                
        return PropositionStrategie(
            nom_agent=proposition_originale.nom_agent,
            confiance=self._recalculer_confiance(proposition_originale, retour),
            proposition=proposition_raffinee,
            priorite=self._ajuster_priorite(proposition_originale.priorite, retour),
            zones_impact=self._mettre_a_jour_zones_impact(proposition_originale.zones_impact, retour)
        )
    
    def _construire_consensus(self, strategie_raffinee: Dict[str, Any]) -> Dict[str, Any]:
        """Construit un consensus final entre les agents"""
        strategie_consensus = {
            'actions_court_terme': [],
            'strategie_moyen_terme': [],
            'objectifs_long_terme': [],
            'metriques_prioritaires': {},
            'facteurs_risque': [],
            'indicateurs_succes': {},
            'chronologie': {},
            'contributions_agents': {}
        }
        
        # Agrège les contributions de chaque agent
        for agent in self.agents:
            contribution = self._obtenir_contribution_agent(agent, strategie_raffinee)
            self._integrer_contribution(strategie_consensus, contribution)
            
        # Ajoute le résumé du débat
        strategie_consensus['resume_debat'] = self._resumer_debat()
        
        return strategie_consensus
    
    def _resumer_debat(self) -> Dict[str, Any]:
        """Résume les points clés du débat entre agents"""
        return {
            'tours': len(self.historique_conversation),
            'accords_cles': self._extraire_accords_cles(),
            'conflits_resolus': self._extraire_conflits_resolus(),
            'niveau_consensus_final': self._calculer_niveau_consensus()
        } 