-- Schema snapshot of the columns used from Apple Books's sqlite
-- databases. Updates here flag schema drift on real Apple updates.

CREATE TABLE ZBKLIBRARYASSET (
  Z_PK INTEGER PRIMARY KEY,
  ZASSETID TEXT,
  ZTITLE TEXT
);

CREATE TABLE ZAEANNOTATION (
  Z_PK INTEGER PRIMARY KEY,
  ZANNOTATIONUUID TEXT,
  ZANNOTATIONASSETID TEXT,
  ZANNOTATIONSELECTEDTEXT TEXT,
  ZANNOTATIONNOTE TEXT,
  ZFUTUREPROOFING5 TEXT,
  ZANNOTATIONLOCATION TEXT,
  ZANNOTATIONMODIFICATIONDATE REAL,
  ZANNOTATIONDELETED INTEGER
);

INSERT INTO ZBKLIBRARYASSET VALUES (1, 'ASSET-MAJORDOMO', 'A Majordomo for Everyone');
INSERT INTO ZBKLIBRARYASSET VALUES (2, 'ASSET-OTHER',     'Some Other Book');

INSERT INTO ZAEANNOTATION VALUES (
  101, 'UUID-A', 'ASSET-MAJORDOMO',
  'A library is a building; a life is a way of living.',
  'fix this metaphor about libraries',
  'Chapter 1: Introduction',
  '0.12',
  801238260.0,
  0
);
INSERT INTO ZAEANNOTATION VALUES (
  102, 'UUID-B', 'ASSET-MAJORDOMO',
  'A bare highlight with no typed note.',
  NULL,
  'Chapter 1: Introduction',
  '0.13',
  801238300.0,
  0
);
INSERT INTO ZAEANNOTATION VALUES (
  103, 'UUID-C', 'ASSET-MAJORDOMO',
  'Another passage I marked.',
  'rewrite the second paragraph',
  'Chapter 2: Engage',
  '0.45',
  801238400.0,
  0
);
INSERT INTO ZAEANNOTATION VALUES (
  104, 'UUID-D', 'ASSET-MAJORDOMO',
  'A passage on a deleted annotation.',
  'will be filtered out',
  'Chapter 2: Engage',
  '0.46',
  801238500.0,
  1
);
INSERT INTO ZAEANNOTATION VALUES (
  201, 'UUID-OTHER', 'ASSET-OTHER',
  'From a different book entirely.',
  'should not appear',
  'Some Chapter',
  '0.5',
  801238600.0,
  0
);
