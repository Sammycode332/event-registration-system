-- Repair URLs that were saved with an accidental backslash, e.g. https\://...
UPDATE events
SET image_url = REPLACE(image_url, E'\\', '')
WHERE image_url LIKE E'%\\%';
