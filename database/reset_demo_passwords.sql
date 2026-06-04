USE coffee_loei_db;
UPDATE admin SET password='admin123', deleted_at=NULL;
UPDATE farm_owner SET password='admin123', status='approved', deleted_at=NULL;
