-- Add continent column to countries table
ALTER TABLE countries ADD COLUMN IF NOT EXISTS continent text;

-- Update existing countries with continent values based on ISO2
UPDATE countries SET continent = CASE
  WHEN iso2 IN ('TH','VN','ID','PH','KH','MM','LA','MY','SG','BN','TL','IN','LK','NP','BT','BD','MV','JP','KR','CN','TW','HK','MO','MN','UZ','KZ','KG','TJ','GE','AM','AZ') THEN 'asia'
  WHEN iso2 IN ('TR','JO','IL','LB','OM','AE','QA','BH','KW','SA','IR','IQ','YE','SY','PS') THEN 'middle_east'
  WHEN iso2 IN ('FR','DE','IT','ES','PT','GB','IE','NL','BE','CH','AT','GR','HR','ME','AL','MK','RS','BA','SI','CZ','SK','PL','HU','RO','BG','DK','SE','NO','FI','IS','EE','LV','LT','MT','CY','LU','MC','AD') THEN 'europe'
  WHEN iso2 IN ('ZA','KE','TZ','MA','EG','GH','NG','SN','ET','RW','UG','MZ','MG','MU','SC','CV','NA','BW','ZM','ZW','TN','DZ','CM','CI') THEN 'africa'
  WHEN iso2 IN ('US','CA','MX','GT','BZ','HN','SV','NI','CR','PA','CU','JM','HT','DO','TT','BS','BB','AG','DM','GD','KN','LC','VC','CO','VE','GY','SR','EC','PE','BO','BR','PY','UY','AR','CL') THEN 'latin_america'
  WHEN iso2 IN ('AU','NZ','FJ','PG','WS','TO','VU','SB','KI','MH','FM','PW','NR','TV') THEN 'oceania'
  ELSE NULL
END;

-- Make NOT NULL after data populated
ALTER TABLE countries ALTER COLUMN continent SET NOT NULL;

-- Index for efficient continent queries
CREATE INDEX idx_countries_continent ON countries(continent);
