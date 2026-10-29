export interface AnalysisResult {
  score: number;
  matchedKeywords: KeywordHit[];
  missingKeywords: KeywordHit[];
  strengths: string[];
  suggestions: string[];
  improvedSummary: string;
  resumeText: string;
  jobDescription: string;
  resumeWordCount: number;
  jobWordCount: number;
  totalKeywords: number;
}

export interface KeywordHit {
  word: string;
  count: number;
}

export const ENGLISH_STOPWORDS = new Set<string>([
  "a","an","the","and","or","but","if","then","else","for","of","to","in","on","at","by","with","from","as","is","are","was","were","be","been","being","have","has","had","do","does","did","will","would","could","should","may","might","must","can","this","that","these","those","i","you","he","she","it","we","they","them","his","her","its","our","their","my","your","me","him","us","am","not","no","so","than","too","very","also","just","about","above","after","again","all","any","because","before","below","between","both","down","during","each","few","further","here","how","into","more","most","near","new","off","once","only","out","over","own","same","some","such","there","under","up","what","when","where","which","while","who","whom","why","role","work","working","experience","experiences","skills","skill","job","jobs","team","teams","ability","plus","etc","able","across","via","per","year","years","month","months","day","days","well","get","got","make","made","using","use","used","include","including","like","need","needs","want","wants","help","helps","helped","good","great","strong","excellent","ensure","ensuring","support","supporting","supported","will","would","you","your","our","we","they","their","required","requirements","responsibility","responsibilities","duties","duty","qualifications","qualification","preferred","nice","nice-to-have","bonus","looking","seeking","join","help","build","create","deliver","manage","lead","drive","develop","design","implement","maintain","test","collaborate","communicate","analyze","report","plan","coordinate","provide","identify","resolve","improve","optimize","partner","stakeholder","stakeholders","customer","customers","client","clients","user","users","product","products","service","services","solution","solutions","project","projects","program","programs","business","businesses","company","companies","organization","organizations","team","teams","department","departments","group","groups","member","members","manager","managers","management","director","directors","officer","officers","vice","president","ceo","cto","cfo","coo","level","levels","position","positions","opportunity","opportunities","career","careers","full","part","time","times","type","types","category","categories","field","fields","area","areas","domain","domains","industry","industries","sector","sectors","market","markets","world","worlds","global","national","local","regional","remote","office","offices","location","locations","city","cities","state","states","country","countries","region","regions","zone","zones","phone","email","address","street","avenue","drive","lane","road","place","court","suite","floor","building","room","box","number","code","zip","postal","contact","website","link","links","page","pages","site","sites","http","https","www","com","org","net","edu","gov","io","co","us","uk","ca","au","de","fr","jp","cn","in","br","mx","ru","za","nz","ie","es","it","pt","nl","be","se","no","fi","dk","ch","at","sg","hk","kr","tw","th","id","my","ph","vn","pl","cz","hu","ro","bg","sk","si","hr","rs","ua","tr","il","ae","sa","eg","ma","ng","ke","ar","cl","co","pe","ve","ec","uy","py","bo","cr","gt","pa","do","sv","hn","ni","cu","ht","jm","bs","bb","tt","gd","lc","vc","ag","dm","kn","ai","ms","kn","vi","pr","vi","gu","mp","as","um","fm","mh","pw","ki","nr","to","tv","fj","sb","vu","ws","to","ck","nu","tk","pw","gu","mp","um","vi","as","fm","mh","ki","nr","to","tv","fj","sb","vu","ws","ck","nu","tk","gu","mp","um","vi","as","fm","mh","ki","nr","to","tv","fj","sb","vu","ws","ck","nu","tk","gu","mp","um","vi","as","fm","mh","ki","nr","to","tv","fj","sb","vu","ws","ck","nu","tk"
]);
