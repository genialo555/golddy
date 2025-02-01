import logging
from pathlib import Path

def setup_logger():
    """Configure le logger pour l'application"""
    # Créer le répertoire des logs s'il n'existe pas
    log_dir = Path('logs')
    log_dir.mkdir(exist_ok=True)
    
    # Configuration du logger
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        handlers=[
            logging.FileHandler('logs/training.log'),
            logging.StreamHandler()
        ]
    )
    
    # Retourner le logger configuré
    return logging.getLogger(__name__) 