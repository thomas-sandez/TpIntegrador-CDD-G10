from app import db
from datetime import datetime

class Image(db.Model):
    __tablename__ = 'images'

    image_id = db.Column(db.String(36), primary_key=True)
    file_path = db.Column(db.String(255), nullable=False)
    upload_time = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "image_id": self.image_id,
            "file_path": self.file_path,
            "upload_time": self.upload_time.isoformat() if self.upload_time else None
        }