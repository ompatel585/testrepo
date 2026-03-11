TRUNCATE TABLE public.course, public.course_term,
public.course_module, public.course_section,
public.course_document, public.course_topic,
public.fee, public.certificate,
public.marks, public.attendance
RESTART IDENTITY CASCADE;

INSERT INTO public.course(
	name, description)
	VALUES 
    ('Level 3-Combatant of Advanced Python Modules', 'Python Modules Description'),
    ('HCSE', 'Data Science Description');
    
    INSERT INTO public.course_term(
	name, "startDate", "endDate", "courseId")
	VALUES ('Term 1', '2024-05-01', '2024-05-07', 1),
    	   ('Term 2', '2024-05-08', '2024-05-15', 1),
    	   ('Term 3', '2024-05-16', '2024-05-19', 1),
    	   ('Term 1', '2024-05-22', '2024-05-25', 2),
    	   ('Term 2', '2024-05-27', '2024-05-29', 2);
    		
INSERT INTO public.course_module(
	title, "courseId", "termId","thumbnail")
	VALUES ('Web Development with Python', 1,  1,'documnet/Artwork for Web-book cover.jpg'),
	('Python Debugger and Regular Expressions', 1,  2,'documnet/Python Debugger and Regular Expressions_book cover.jpg'),
	('File Handling with Python', 1, 3,'documnet/Artwork for Web-book cover.jpg'),
	('Advance File Handling with Python', 1, 3,'documnet/Artwork for Web-book cover.jpg'),
	('Frontend Web Development with ReactJS', 2, 4,'documnet/Artwork for Web-book cover.jpg'),
	('Data Science with Python', 2, 5,'documnet/Python Debugger and Regular Expressions_book cover.jpg');
	
	
INSERT INTO public.course_section(
	title, "moduleId")
	VALUES ('Introduction to Web Development with Python', 1),
	    ('Introduction to Python Debugger and Regular Expressions', 2),
	    ('Introduction to File Handling with Python', 3),
	    ('Introduction to Advance File Handling with Python', 4),
	    ('Frontend Web Development with React', 5),
	    ('Introduction to Data Science with Python', 6),
	    ('Introduction to Data Science', 6);
    

INSERT INTO public.course_document(
	title, type,url,duration,content)
	VALUES ('Introduction', 'video', 'documnet/video1.mp4',240,null),
    		('Color Grading', 'document', 'documnet/Artwork for Web.pdf',120,null),
    		('Full Stack', 'video','documnet/FULL STACK_Book Video.mp4',121,null),
    		('Python Debugger', 'document','documnet/Python Debugger and Regular Expressions_ACE-INTL.pdf',240,null),
    		('Web Development', 'document', 'documnet/Web Development with Python_ACE-INTL.pdf',120,null),
    		('File Handeling', 'document','documnet/Artwork for Web.pdf',121,null),
    		('Web Development React', 'document','documnet/Web Development with Python_ACE-INTL.pdf',240,null),
    		('Web Development ReactJS', 'video', 'documnet/FULL STACK_Book Video.mp4',120,null),
    		('Data Science', 'document','documnet/Artwork for Web.pdf',121,null),
    		('Data Science 101', 'video','documnet/FULL STACK_Book Video.mp4',121,null),	
			('Data Science Quiz', 'quiz',null,121,'[{"type":"singleSelect","question":"Who is the national animal of India?","options":["tiger","elephant","lion","deer"],"answer":"tiger"},{"type":"multiSelect","question":"Select all birds","options":["eagle","tiger","sparrow","parrot"],"answer":["eagle","sparrow","parrot"]},{"type":"trueOrFalse","question":"Tiger is the national animal of America","options":["true","false"],"answer":"false"},{"type":"multiTrueOrFalse","question":"National animals of India","options":[{"question":"tiger","option":["true","false"],"answer":"true"},{"question":"lion","option":["true","false"],"answer":"false"},{"question":"peacock","option":["true","false"],"answer":"true"}],"answer":["true","false","true"]},{"type":"arrangeInSequence","question":"Arrange the order based on height, smallest first","options":["elephant","tiger","rat","whale"],"answer":["rat","tiger","elephant","whale"]},{"type":"matchColumn","question":"Which animal belongs to which habitat?","options1":["water","land","ice","sky"],"options2":["tiger","whale","parrot","polar bear"],"answer":["whale","tiger","polar bear","parrot"]}]');	
    

INSERT INTO public.course_topic(
	title, type,"sectionId","documentId")
	VALUES ('Web Development', 'document',1,1),
    		('Python Debugger', 'document', 2,2 ),
    		('Introduction to File Handling with Python', 'document',3,3),
    		('Advance File Handling', 'document',4,4),
    		('Web Development React', 'document', 5,5),
    		('Web Development with ReactJS', 'video',6,10),
    		('Data Science with Python', 'document',7,6),
    		('Data Science 101', 'video', 7,7),
			('Data Science Quiz', 'quiz', 7,11);
    		
INSERT INTO public.fee(
	"bookingCode", date, amount, paid, due, status, "userId", url)
	VALUES 
	('dfefece', '2024-05-01', 12000, 6000, 6000, 'pending', 1, 'documnet/Booking Confirmation.htm'),
	('dcerere', '2024-05-28', 30000, 30000, 0, 'paid', 1, 'documnet/Booking Confirmation.htm');
	
INSERT INTO public.certificate(
	"courseId", "termId", url)
	VALUES 
	(1, 1, 'documnet/Ayushi_Term1_ePS.pdf'),
	(1, 2, 'documnet/Ayushi_Term2_ePS.pdf'),
	(1, null, 'documnet/Ayushi_Term1_ePS.pdf'),
	(2, null, 'documnet/Ayushi_Term2_ePS.pdf'),
	(1, 3, 'documnet/Ayushi_Term1_ePS.pdf'),
	(2, 4, 'documnet/Ayushi_Term2_ePS.pdf'),
	(2, 5, 'documnet/Ayushi_Term1_ePS.pdf');
	
INSERT INTO public.marks(
	exam, "totalMarks", "obtainedMarks", "weightAge", "courseId", "termId")
	VALUES 
	('project', 100, 80, 80, 1, 1),
	('internal1', 50, 34, 68, 1, 1),
	('project', 100, 67, 67, 1, 2),
	('term end', 100, 80, 80, 1, 2),
	('internal1', 50, 34, 68, 1, 3),
	('term end', 100, 67, 67, 1, 3),
	('project', 100, 67, 67, 2, 4),
	('internal 1', 100, 67, 67, 2, 4),
	('project', 100, 67, 67, 2, 5);
	
INSERT INTO public.attendance(
	status, "courseId", "termId", "userId")
	VALUES 
	('present', 1, 1, 1),
	('present', 1, 1, 1),
	('absent', 1, 1, 1),
	('present', 1, 2, 1),
	('present', 1, 2, 1),
	('absent', 1, 2, 1);