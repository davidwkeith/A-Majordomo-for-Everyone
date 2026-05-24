-- Schema snapshot of the columns used from Apple Books's sqlite databases.

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
  ZANNOTATIONREPRESENTATIVETEXT TEXT,
  ZANNOTATIONNOTE TEXT,
  ZANNOTATIONLOCATION TEXT,
  ZANNOTATIONMODIFICATIONDATE REAL,
  ZANNOTATIONDELETED INTEGER
);

INSERT INTO ZBKLIBRARYASSET VALUES (1, 'ASSET-MAJORDOMO', 'Majordomo');
INSERT INTO ZBKLIBRARYASSET VALUES (2, 'ASSET-OTHER',     'Some Other Book');

INSERT INTO ZAEANNOTATION VALUES (
  101, 'UUID-A', 'ASSET-MAJORDOMO',
  'A library is a building',
  'A library is a building; a life is a way of living.',
  'fix this metaphor about libraries',
  'epubcfi(/6/4[00-epigraph]!/4/2/6/2/1,:3,:55)',
  801238260.0,
  0
);
INSERT INTO ZAEANNOTATION VALUES (
  102, 'UUID-B', 'ASSET-MAJORDOMO',
  'bare highlight',
  'A bare highlight with no typed note.',
  NULL,
  'epubcfi(/6/4[00-epigraph]!/4/2/8/1,:0,:36)',
  801238300.0,
  0
);
INSERT INTO ZAEANNOTATION VALUES (
  103, 'UUID-C', 'ASSET-MAJORDOMO',
  'Another passage',
  'Another passage I marked.',
  'rewrite the second paragraph',
  'epubcfi(/6/8[01-chapter-01]!/4/4/2,:0,:24)',
  801238400.0,
  0
);
INSERT INTO ZAEANNOTATION VALUES (
  104, 'UUID-D', 'ASSET-MAJORDOMO',
  'deleted',
  'A passage on a deleted annotation.',
  'will be filtered out',
  'epubcfi(/6/8[01-chapter-01]!/4/4/4,:0,:31)',
  801238500.0,
  1
);
INSERT INTO ZAEANNOTATION VALUES (
  105, 'UUID-E', 'ASSET-MAJORDOMO',
  'empty whitespace note',
  'A row with a whitespace-only ZANNOTATIONNOTE.',
  '   ',
  'epubcfi(/6/4[00-epigraph]!/4/2/10/1,:0,:20)',
  801238550.0,
  0
);
INSERT INTO ZAEANNOTATION VALUES (
  201, 'UUID-OTHER', 'ASSET-OTHER',
  'From other',
  'From a different book entirely.',
  'should not appear',
  'epubcfi(/6/2[chapter-1]!/4/2/1,:0,:30)',
  801238600.0,
  0
);
