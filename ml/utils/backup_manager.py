from typing import Dict, Any, Optional
import os
import shutil
from datetime import datetime, timedelta
import json
import logging
from pathlib import Path
import hashlib

class BackupManager:
    def __init__(self, base_path: str = "backups"):
        self.logger = logging.getLogger('backup_manager')
        self.base_path = Path(base_path)
        self.config = self._load_backup_config()
        self.backup_history = []
        
    def create_backup(self, state: Dict[str, Any], backup_type: str = "auto") -> bool:
        """Crée un backup avec vérification d'intégrité"""
        try:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            backup_dir = self.base_path / backup_type / timestamp
            backup_dir.mkdir(parents=True, exist_ok=True)
            
            # Sauvegarde des données
            metadata = {
                'timestamp': timestamp,
                'type': backup_type,
                'checksum': self._calculate_checksum(state),
                'version': state.get('version', '1.0.0')
            }
            
            # Sauvegarde des fichiers
            self._save_state_files(state, backup_dir)
            self._save_metadata(metadata, backup_dir)
            
            # Vérifie l'intégrité
            if self._verify_backup(backup_dir, metadata['checksum']):
                self._update_backup_history(metadata)
                self._cleanup_old_backups()
                return True
                
            return False
            
        except Exception as e:
            self.logger.error(f"Backup creation failed: {e}")
            return False
            
    def restore_from_backup(self, timestamp: Optional[str] = None) -> Optional[Dict[str, Any]]:
        """Restaure depuis un backup avec vérification"""
        try:
            backup_path = self._get_backup_path(timestamp)
            if not backup_path:
                return None
                
            # Vérifie l'intégrité avant restauration
            metadata = self._load_metadata(backup_path)
            if not self._verify_backup(backup_path, metadata['checksum']):
                self.logger.error("Backup integrity check failed")
                return None
                
            # Restaure les données
            return self._load_state_files(backup_path)
            
        except Exception as e:
            self.logger.error(f"Restore failed: {e}")
            return None
            
    def _calculate_checksum(self, state: Dict[str, Any]) -> str:
        """Calcule un checksum des données"""
        state_str = json.dumps(state, sort_keys=True)
        return hashlib.sha256(state_str.encode()).hexdigest()
        
    def _cleanup_old_backups(self):
        """Nettoie les vieux backups selon la politique de rétention"""
        try:
            retention = self.config['retention_policy']
            for backup_type, max_age in retention.items():
                cutoff_date = datetime.now() - timedelta(days=max_age)
                
                backup_dir = self.base_path / backup_type
                if not backup_dir.exists():
                    continue
                    
                for backup in backup_dir.iterdir():
                    if self._is_backup_expired(backup, cutoff_date):
                        shutil.rmtree(backup)
                        self.logger.info(f"Removed old backup: {backup}")
                        
        except Exception as e:
            self.logger.error(f"Cleanup failed: {e}")
            
    def _verify_backup(self, backup_dir: Path, original_checksum: str) -> bool:
        """Vérifie l'intégrité d'un backup"""
        try:
            state = self._load_state_files(backup_dir)
            current_checksum = self._calculate_checksum(state)
            return current_checksum == original_checksum
        except Exception as e:
            self.logger.error(f"Verification failed: {e}")
            return False 