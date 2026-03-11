INSERT INTO public."user"
	("userId", name, mobile, email, password, role, "organizationId", "brandId", "centreName")
VALUES
	('aptrack01', 'std01', '9999999901', 'std01@mail.com', 'password', 'student', 1, 3, "MAAC Serampore"),
	('aptrack02', 'std02', '9999999902', 'std02@mail.com', 'password', 'student', 1, 3, "MAAC Serampore"),
	('aptrack03', 'std03', '9999999903', 'std03@mail.com', 'password', 'student', 1, 3, "MAAC Serampore"),
	(null, 'guest01', '8999999901', 'guest01@mail.com', 'password', 'guest', 1, null, "MAAC Serampore"),
	(null, 'guest02', null, 'guest02@mail.com', 'password', 'guest', 1, null, "MAAC Serampore"),
	(null, 'guest03', '8999999903', null, 'password', 'guest', 1, null, "MAAC Serampore"),
	('aptrackfac01', 'fac01', '9999999901', 'fac01@mail.com', 'password', 'faculty', 1, 3, "MAAC Serampore"),
	('aptrackfac02', 'fac02', '9999999902', 'fac02@mail.com', 'password', 'faculty', 1, 3, "MAAC Serampore"),
	('aptrackfac03', 'fac03', '9999999903', 'fac03@mail.com', 'password', 'faculty', 1, 3, "MAAC Serampore"),
	('aptrackplc01', 'plc01', '9999999902', 'plc01@mail.com', 'password', 'placement', 1, 3, "MAAC Serampore"),
	('aptrackplc02', 'plc02', '9999999902', 'plc02@mail.com', 'password', 'placement', 1, 3, "MAAC Serampore"),
	('aptrackplc03', 'plc03', '9999999902', 'plc03@mail.com', 'password', 'placement', 1, 3, "MAAC Serampore"),
	('aptrackcntr01', 'cntr01', '9999999902', 'cntr01@mail.com', 'password', 'center', 1, 3, "MAAC Serampore"),
	('aptrackcntr02', 'cntr02', '9999999902', 'cntr02@mail.com', 'password', 'center', 1, 3, "MAAC Serampore"),
	('aptrackcntr03', 'cntr03', '9999999902', 'cntr03@mail.com', 'password', 'center', 1, 3, "MAAC Serampore");