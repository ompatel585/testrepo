-- update userType in user table
update "user" set "userType" = 'student'
WHERE roles::text
[] @> ARRAY['student'];

update "user" set "userType" = 'CE'
WHERE roles::text
[] && ARRAY['faculty', 'CH', 'CAH'];

-- UPDATE "user" u
-- SET "userType"
-- = 'CE'
-- WHERE EXISTS
-- (
--     SELECT 1
-- FROM user_role ur
-- WHERE ur."userId" = u.id
--     AND ur.role IN ('faculty', 'CAH', 'CH')
-- );

-- migration in user_role table

-- student
INSERT INTO user_role
    ("userId", role, "brandId", zone, region, area, "centreName", "centreId")
SELECT id, 'student', "brandId", zone, region, area, "centreName", "centreId"
FROM "user"
WHERE roles::text
[] @> ARRAY['student'];

-- faculty
INSERT INTO user_role
    ("userId", role, "brandId", "centreIds")
SELECT id, 'faculty', "brandId", "centreIds"
FROM "user"
WHERE roles::text
[] @> ARRAY['faculty'];

-- CH
INSERT INTO user_role
    ("userId", role, "brandId", "centreIds")
SELECT id, 'CH', "brandId", "centreIds"
FROM "user"
WHERE roles::text
[] @> ARRAY['CH'];


-- INSERT INTO user_role ("userId", role, "brandId", "centreIds")
-- SELECT 
--     u.id,
--     'CH',
--     u."brandId",
--     u."centreIds"
-- FROM "user" u
-- WHERE u.roles::text[] @> ARRAY['CH']
--   AND NOT EXISTS (
--       SELECT 1
--       FROM user_role ur
--       WHERE ur."userId" = u.id
--         AND ur.role = 'CH'
--   );

-- CAH
INSERT INTO user_role
    ("userId", role, "brandId", "centreIds")
SELECT id, 'CAH', "brandId", "centreIds"
FROM "user"
WHERE roles::text
[] @> ARRAY['CAH'];

-- INSERT INTO user_role ("userId", role, "brandId", "centreIds")
-- SELECT 
--     u.id,
--     'CAH',
--     u."brandId",
--     u."centreIds"
-- FROM "user" u
-- WHERE u.roles::text[] @> ARRAY['CAH']
--   AND NOT EXISTS (
--       SELECT 1
--       FROM user_role ur
--       WHERE ur."userId" = u.id
--         AND ur.role = 'CAH'
--   );

-- admin
INSERT INTO user_role
    ("userId", role)
SELECT id, 'admin'
FROM "user"
WHERE roles::text
[] @> ARRAY['admin'];

-- intJury
INSERT INTO user_role
    ("userId", role, "brandId")
SELECT id, 'intJury', "brandId"
FROM "user"
WHERE roles::text
[] @> ARRAY['intJury'];

-- extJury
INSERT INTO user_role
    ("userId", role, "brandId")
SELECT id, 'extJury', "brandId"
FROM "user"
WHERE roles::text
[] @> ARRAY['extJury'];

-- moderator
INSERT INTO user_role
    ("userId", role, "brandId", "subBrandIds")
SELECT id, 'moderator', "brandId", "subBrandIds"
FROM "user"
WHERE roles::text
[] @> ARRAY['moderator'];

-- digitalAuditor
INSERT INTO user_role
    ("userId", role, "brandId", "subBrandIds")
SELECT id, 'digitalAuditor', "brandId", "subBrandIds"
FROM "user"
WHERE roles::text
[] @> ARRAY['digitalAuditor'];




-- sub-brand update with default brand values

update brand
set "subBrandIds" = Array["id"]
where "subBrandIds" = '{}';