INSERT INTO categories
  (name)
VALUES
  ('Graphic Design'),
  ('Digital Art'),
  ('Videography'),
  ('Fashion'),
  ('Photography'),
  ('UI/UX'),
  ('3D');


INSERT INTO skill_category
  (name)
VALUES
  ('2D ANIMATION'),
  ('3D ANIMATION'),
  ('GAMES'),
  ('MOTION GRAPHICS'),
  ('GRAPHIC DESIGNING'),
  ('UI/UX'),
  ('WEB DESIGNING'),
  ('ARCHITECTURE'),
  ('DIGITAL MARKETING'),
  ('VFX'),
  ('VIDEO EDITING'),
  ('VIRTUAL PRODUCTION');


INSERT INTO Job_Profile
  ("name", "skillCategoryId")
VALUES
  ('2D ANIMATION ARTIST', 1),
  ('2D CONCEPT ARTIST', 1),
  ('STORYBOARD ARTIST', 1),
  ('3D ANIMATION ARTIST', 2),
  ('3D CHARACTER DESIGNER', 2),
  ('3D GENERALIST', 2),
  ('3D MODELING & TEXTURING ARTIST', 2),
  ('3D RIGGING ARTIST', 2),
  ('3D VISUALIZER', 2),
  ('LAYOUT ARTIST', 2),
  ('LIGHTING ARTIST', 2),
  ('PRODUCTION COORDINATOR', 2),
  ('3D ENVIRONMENT ARTIST', 2),
  ('PROP ARTIST', 2),
  ('3D GAME ARTIST', 3),
  ('GAME DEVELOPER', 3),
  ('GAME TESTER', 3),
  ('UNREAL ARTIST', 3),
  ('GAME DESIGNER', 3),
  ('MOTION GRAPHIC ARTIST', 4),
  ('GRAPHIC DESIGNER', 5),
  ('PHOTOSHOP ARTIST', 5),
  ('PHOTOGRAPHER & VIDEOGRAPHER', 5),
  ('PACKAGE DESIGNING', 5),
  ('ILLUSTRATION ARTIST', 5),
  ('IMAGE EDITOR', 5),
  ('CHARACTER ILLUSTRATOR', 5),
  ('UI/UX DESIGNER', 6),
  ('PRODUCT DESIGNER & UX SPECIALIST', 6),
  ('WEB DESIGNER', 7),
  ('INTERIOR DESIGNER', 8),
  ('3D ARCHITECT VISUALISER', 8),
  ('DIGITAL CONTENT DESIGNER', 9),
  ('DIGITAL MARKETING ARTIST', 9),
  ('SOCIAL MEDIA MANAGER', 9),
  ('COMPOSITING ARTIST', 10),
  ('LIGHTING ARTIST', 10),
  ('MATCH MOVE ARTIST', 10),
  ('MATTE PAINT ARTIST', 10),
  ('ROTO ARTIST', 10),
  ('RENDER ARTIST', 10),
  ('POST PRODUCTION ARTIST', 10),
  ('VFX ARTIST', 10),
  ('VIDEO EDITOR', 11),
  ('PRODUCTION DESIGNER', 12),
  ('REAL-TIME LIGHTING SUPERVISOR', 12),
  ('CAMERA OPERATOR', 12),
  ('MOTION CAPTURE SPECIALIST', 12),
  ('3D ARTIST/MODELER', 12);

ALTER SEQUENCE brand_id_seq RESTART WITH 1;

INSERT INTO brand
  (name, code, key, icon)
VALUES
  ('Arena Animation', 'ARENA', 44,
    'https://proconnect-public-s3.s3.ap-south-1.amazonaws.com/brand-logos/arena-logo.png'),
  ('LAKME ACADEMY POWERED BY APTECH', 'LAPA', 111,
    'https://proconnect-public-s3.s3.ap-south-1.amazonaws.com/brand-logos/lakme-logo.png'),
  ('MAAC', 'MAAC', 104,
    'https://proconnect-public-s3.s3.ap-south-1.amazonaws.com/brand-logos/maac-logo.png'),
  ('Aptech Computer Education', 'ACE', 22, null),
  ('Aptech Hardware & Networking Academy', 'N-POWER', 26, null),
  ('Aptech Worldwide', 'International', 55, null),
  ('Aptech Aviation and Hospitality Academy', 'AAA', 61, null),
  ('Aptech English Learning Academy', 'EE', 72, null),
  ('Brazil Aptech', 'Brazil Aptech', 101, null),
  ('ARENA POINT', 'ARENA POINT', 102, null),
  ('Aptech-Satellite', 'Aptech-Satellite', 107, null),
  ('Aptech Retail Training', 'Aptech Retail Trng', 108, null),
  ('Aptech', 'Aptech', 109, null),
  ('Aptech Banking & Finance Academy', 'ABFA', 110, null),
  ('Aptech Learning', 'APL', 113, null),
  ('Jagannath University - Aptech B.Voc Course', 'Jagannath University', 114, null),
  ('MAAC - Blended Direct', 'MBD', 116, null),
  ('Aptech IT Careers', 'AIC', 117, null),
  ('Arena Animation', 'Arena Animation', 118, null),
  ('TVPA', 'TVPA', 119, null);

INSERT INTO city
  ("name")
VALUES
  ('Mumbai'),
  ('Thane'),
  ('Pune'),
  ('Bangalore'),
  ('Chennai'),
  ('Delhi'),
  ('Kolkota');

INSERT INTO job_type
  ("name")
VALUES
  ('Full Time'),
  ('Freelance'),
  ('Remote');



INSERT INTO job_title
  ("name")
VALUES
  ('2D ANIMATION ARTIST'),
  ('2D CONCEPT ARTIST'),
  ('STORYBOARD ARTIST'),
  ('3D ANIMATION ARTIST'),
  ('3D CHARACTER DESIGNER'),
  ('3D GENERALIST'),
  ('3D MODELING & TEXTURING ARTIST'),
  ('3D RIGGING ARTIST'),
  ('3D VISUALIZER'),
  ('LAYOUT ARTIST'),
  ('LIGHTING ARTIST'),
  ('PRODUCTION COORDINATOR'),
  ('3D ENVIRONMENT ARTIST'),
  ('PROP ARTIST'),
  ('3D GAME ARTIST'),
  ('GAME DEVELOPER'),
  ('GAME TESTER'),
  ('UNREAL ARTIST'),
  ('GAME DESIGNER'),
  ('MOTION GRAPHIC ARTIST'),
  ('GRAPHIC DESIGNER'),
  ('PHOTOSHOP ARTIST'),
  ('PHOTOGRAPHER & VIDEOGRAPHER'),
  ('PACKAGE DESIGNING'),
  ('ILLUSTRATION ARTIST'),
  ('IMAGE EDITOR'),
  ('CHARACTER ILLUSTRATOR'),
  ('UI/UX DESIGNER'),
  ('PRODUCT DESIGNER & UX SPECIALIST'),
  ('WEB DESIGNER'),
  ('INTERIOR DESIGNER'),
  ('3D ARCHITECT VISUALISER'),
  ('DIGITAL CONTENT DESIGNER'),
  ('DIGITAL MARKETING ARTIST'),
  ('SOCIAL MEDIA MANAGER'),
  ('COMPOSITING ARTIST'),
  ('MATCH MOVE ARTIST'),
  ('MATTE PAINT ARTIST'),
  ('ROTO ARTIST'),
  ('RENDER ARTIST'),
  ('POST PRODUCTION ARTIST'),
  ('VFX ARTIST'),
  ('VIDEO EDITOR'),
  ('PRODUCTION DESIGNER'),
  ('REAL-TIME LIGHTING SUPERVISOR'),
  ('CAMERA OPERATOR'),
  ('MOTION CAPTURE SPECIALIST'),
  ('3D ARTIST/MODELER');


INSERT INTO public."company_category"
  ("name")
VALUES
  ('Maketing Agency'),
  ('Manufacturing'),
  ('Information Technology');


INSERT INTO public."company_type"
  ("name")
VALUES
  ('A'),
  ('B'),
  ('C');

