import { supabase } from "@/integrations/supabase/client";

interface StudentData {
  matricule: string;
  nom: string;
  prenom: string;
  dateNaissance: string;
  cin: string;
  code: string;
  libelleLong: string;
  telephone: string;
}

// Parse date from DD/MM/YYYY HH:MM:SS format to YYYY-MM-DD
function parseDate(dateStr: string): string {
  const parts = dateStr.split(' ')[0].split('/');
  if (parts.length === 3) {
    return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
  }
  return dateStr;
}

export const studentsToImport: StudentData[] = [
  { matricule: "2007102700175", nom: "JAFA", prenom: "ISMAIL", dateNaissance: "2007-10-27", cin: "BA65247", code: "DEV101", libelleLong: "DIA_DEV_TS_1A-Développement Digital (1A)-2025", telephone: "" },
  { matricule: "2006092300195", nom: "EL BERRIM", prenom: "OTHMANE", dateNaissance: "2006-09-23", cin: "BK749225", code: "ID101", libelleLong: "DIA_ID_TS_1A-Infrastructure Digitale (1A)-2025", telephone: "" },
  { matricule: "2007072900167", nom: "HASSOUN", prenom: "KAWTAR", dateNaissance: "2007-07-29", cin: "BK766450", code: "DEV104", libelleLong: "DIA_DEV_TS_1A-Développement Digital (1A)-2025", telephone: "0719761190" },
  { matricule: "2007051400152", nom: "OUCHAINE", prenom: "AYA", dateNaissance: "2007-05-14", cin: "BW69422", code: "DEV104", libelleLong: "DIA_DEV_TS_1A-Développement Digital (1A)-2025", telephone: "" },
  { matricule: "2007031800213", nom: "EL MASMOUDI", prenom: "ZAKARIA", dateNaissance: "2007-03-18", cin: "BW55450", code: "ID102", libelleLong: "DIA_ID_TS_1A-Infrastructure Digitale (1A)-2025", telephone: "0636240853" },
  { matricule: "2008010700095", nom: "CHAFIK", prenom: "HAITHAM", dateNaissance: "2008-01-07", cin: "BK761109", code: "DEV106", libelleLong: "DIA_DEV_TS_1A-Développement Digital (1A)-2025", telephone: "0663516011" },
  { matricule: "2006092400111", nom: "ELHARTI", prenom: "ILIAS", dateNaissance: "2006-09-24", cin: "BW63809", code: "ID103", libelleLong: "DIA_ID_TS_1A-Infrastructure Digitale (1A)-2025", telephone: "" },
  { matricule: "2007062200154", nom: "EL JADIDI", prenom: "KARIM", dateNaissance: "2007-06-22", cin: "BK760616", code: "DEV107", libelleLong: "DIA_DEV_TS_1A-Développement Digital (1A)-2025", telephone: "0675352277" },
  { matricule: "2007072000112", nom: "EL OMARI", prenom: "MOHAMMED", dateNaissance: "2007-07-20", cin: "M710813", code: "ID104", libelleLong: "DIA_ID_TS_1A-Infrastructure Digitale (1A)-2025", telephone: "0693534593" },
  { matricule: "2004012300411", nom: "AYYACHE", prenom: "EL HOUSSINE", dateNaissance: "2004-01-23", cin: "BH643476", code: "DEV101", libelleLong: "DIA_DEV_TS_1A-Développement Digital (1A)-2025", telephone: "0777794392" },
  { matricule: "2007122400120", nom: "KOUCHE", prenom: "AHLAM", dateNaissance: "2007-12-24", cin: "BW75184", code: "DEV102", libelleLong: "DIA_DEV_TS_1A-Développement Digital (1A)-2025", telephone: "" },
  { matricule: "2007020600272", nom: "KHALIL", prenom: "LAILA", dateNaissance: "2007-02-06", cin: "BW61951", code: "DEV103", libelleLong: "DIA_DEV_TS_1A-Développement Digital (1A)-2025", telephone: "0663502980" },
  { matricule: "2008012100071", nom: "AIT AHMED", prenom: "MOUAD", dateNaissance: "2008-01-21", cin: "BK767827", code: "DEV102", libelleLong: "DIA_DEV_TS_1A-Développement Digital (1A)-2025", telephone: "0695506161" },
  { matricule: "2006112800148", nom: "BELGAS", prenom: "HAYTAM", dateNaissance: "2006-11-28", cin: "BE950419", code: "ID102", libelleLong: "DIA_ID_TS_1A-Infrastructure Digitale (1A)-2025", telephone: "0642267845" },
  { matricule: "2007102000143", nom: "SOUFIAN", prenom: "HAYTAM", dateNaissance: "2007-10-20", cin: "BW80520", code: "ID101", libelleLong: "DIA_ID_TS_1A-Infrastructure Digitale (1A)-2025", telephone: "0714486609" },
  { matricule: "2006070400125", nom: "MOULOUAD", prenom: "ZIAD", dateNaissance: "2006-07-04", cin: "BW56838", code: "DEV107", libelleLong: "DIA_DEV_TS_1A-Développement Digital (1A)-2025", telephone: "0619743142" },
  { matricule: "2007100300179", nom: "DOULQUAMAR", prenom: "BACHAR", dateNaissance: "2007-10-03", cin: "BW76114", code: "DEV104", libelleLong: "DIA_DEV_TS_1A-Développement Digital (1A)-2025", telephone: "0641238118" },
  { matricule: "2007121000119", nom: "ETTAOUBI", prenom: "ILHAM", dateNaissance: "2007-12-10", cin: "WA358901", code: "DEV105", libelleLong: "DIA_DEV_TS_1A-Développement Digital (1A)-2025", telephone: "0698103794" },
  { matricule: "2008022800124", nom: "BARKI", prenom: "REDA-ALLAH", dateNaissance: "2008-02-28", cin: "BW77581", code: "DEV104", libelleLong: "DIA_DEV_TS_1A-Développement Digital (1A)-2025", telephone: "0688116894" },
  { matricule: "2007021900095", nom: "AHYOD", prenom: "ILYAS", dateNaissance: "2007-02-19", cin: "BW71726", code: "ID104", libelleLong: "DIA_ID_TS_1A-Infrastructure Digitale (1A)-2025", telephone: "0659895346" },
  { matricule: "2006071500288", nom: "ELBOULQE", prenom: "ABDERRAHIM", dateNaissance: "2006-07-15", cin: "BV7372", code: "ID101", libelleLong: "DIA_ID_TS_1A-Infrastructure Digitale (1A)-2025", telephone: "0646904701" },
  { matricule: "2007080600140", nom: "HABCHI", prenom: "OTHMAN", dateNaissance: "2007-08-06", cin: "BW81530", code: "ID103", libelleLong: "DIA_ID_TS_1A-Infrastructure Digitale (1A)-2025", telephone: "0653952092" },
  { matricule: "2007112400062", nom: "AAINOUSS", prenom: "YAHYA", dateNaissance: "2007-11-24", cin: "BW67314", code: "DEV101", libelleLong: "DIA_DEV_TS_1A-Développement Digital (1A)-2025", telephone: "0773226915" },
  { matricule: "2007011900087", nom: "ENNAQUI", prenom: "ILYASS", dateNaissance: "2007-01-19", cin: "BA45045", code: "DEV106", libelleLong: "DIA_DEV_TS_1A-Développement Digital (1A)-2025", telephone: "0634964272" },
  { matricule: "2006103100217", nom: "EL HANI", prenom: "HANA", dateNaissance: "2006-10-31", cin: "BE948072", code: "ID103", libelleLong: "DIA_ID_TS_1A-Infrastructure Digitale (1A)-2025", telephone: "0660275429" },
  { matricule: "2006060900141", nom: "EL-JAOUHARY", prenom: "WIAM", dateNaissance: "2006-06-09", cin: "BE948233", code: "ID103", libelleLong: "DIA_ID_TS_1A-Infrastructure Digitale (1A)-2025", telephone: "0629267277" },
  { matricule: "2007102100085", nom: "EL KATIF", prenom: "RAYANE", dateNaissance: "2007-10-21", cin: "BW76484", code: "DEV107", libelleLong: "DIA_DEV_TS_1A-Développement Digital (1A)-2025", telephone: "0694905536" },
  { matricule: "2002080400478", nom: "EL HAMDACHI", prenom: "MOHAMED", dateNaissance: "2002-08-04", cin: "BK741172", code: "ID104", libelleLong: "DIA_ID_TS_1A-Infrastructure Digitale (1A)-2025", telephone: "" },
  { matricule: "2007082400141", nom: "EL FAKIRI", prenom: "WAIL", dateNaissance: "2007-08-24", cin: "BK756597", code: "ID101", libelleLong: "DIA_ID_TS_1A-Infrastructure Digitale (1A)-2025", telephone: "" },
  { matricule: "2006051200272", nom: "AIT JMAL", prenom: "HIBA", dateNaissance: "2006-05-12", cin: "BK759016", code: "DEV103", libelleLong: "DIA_DEV_TS_1A-Développement Digital (1A)-2025", telephone: "0660080158" },
  { matricule: "2008020400082", nom: "ABER", prenom: "YOUSSEF", dateNaissance: "2008-02-04", cin: "BW66489", code: "ID102", libelleLong: "DIA_ID_TS_1A-Infrastructure Digitale (1A)-2025", telephone: "0620577421" },
  { matricule: "2007070400114", nom: "BENKENDIL", prenom: "ABDERRAHMANE", dateNaissance: "2007-07-04", cin: "BW81106", code: "ID101", libelleLong: "DIA_ID_TS_1A-Infrastructure Digitale (1A)-2025", telephone: "0661086927" },
  { matricule: "2007061400196", nom: "MOUSLIK", prenom: "IKHLAS", dateNaissance: "2007-06-14", cin: "BW80018", code: "DEV102", libelleLong: "DIA_DEV_TS_1A-Développement Digital (1A)-2025", telephone: "0779302220" },
  { matricule: "2002070800450", nom: "AIT ICHOU", prenom: "ZAKARIA", dateNaissance: "2002-07-08", cin: "JC626928", code: "ID101", libelleLong: "DIA_ID_TS_1A-Infrastructure Digitale (1A)-2025", telephone: "0678331675" },
  { matricule: "2008022000078", nom: "ZIZA", prenom: "MOHAMED", dateNaissance: "2008-02-20", cin: "BL187047", code: "DEV103", libelleLong: "DIA_DEV_TS_1A-Développement Digital (1A)-2025", telephone: "0641566228" },
  { matricule: "2006110800176", nom: "BAHJA", prenom: "ADAM", dateNaissance: "2006-11-08", cin: "BE948476", code: "DEV106", libelleLong: "DIA_DEV_TS_1A-Développement Digital (1A)-2025", telephone: "" },
  { matricule: "2007072400166", nom: "DOUIDI", prenom: "YASSINE", dateNaissance: "2007-07-24", cin: "WA362323", code: "ID103", libelleLong: "DIA_ID_TS_1A-Infrastructure Digitale (1A)-2025", telephone: "0642442886" },
  { matricule: "2008012000093", nom: "OUABI", prenom: "YASMINE", dateNaissance: "2008-01-20", cin: "BW82618", code: "DEV102", libelleLong: "DIA_DEV_TS_1A-Développement Digital (1A)-2025", telephone: "" },
  { matricule: "2006120600103", nom: "LIKAMA", prenom: "RAYANE", dateNaissance: "2006-12-06", cin: "BF24342", code: "ID102", libelleLong: "DIA_ID_TS_1A-Infrastructure Digitale (1A)-2025", telephone: "0651977621" },
  { matricule: "2006122600232", nom: "EL MAHBOUBI", prenom: "SALMA", dateNaissance: "2006-12-26", cin: "BJ496155", code: "DEV105", libelleLong: "DIA_DEV_TS_1A-Développement Digital (1A)-2025", telephone: "" },
  { matricule: "2006121100227", nom: "HARIT", prenom: "HIBA", dateNaissance: "2006-12-11", cin: "BW67293", code: "ID103", libelleLong: "DIA_ID_TS_1A-Infrastructure Digitale (1A)-2025", telephone: "" },
  { matricule: "2007013000224", nom: "EL KASSOUI", prenom: "RAYANE", dateNaissance: "2007-01-30", cin: "BW54176", code: "DEV105", libelleLong: "DIA_DEV_TS_1A-Développement Digital (1A)-2025", telephone: "" },
  { matricule: "2007031500191", nom: "CHAOUKI", prenom: "MAROUANE", dateNaissance: "2007-03-15", cin: "BW68717", code: "ID103", libelleLong: "DIA_ID_TS_1A-Infrastructure Digitale (1A)-2025", telephone: "" },
  { matricule: "2004021200419", nom: "BYKBANE", prenom: "YOUSSEF", dateNaissance: "2004-02-12", cin: "BK730414", code: "ID101", libelleLong: "DIA_ID_TS_1A-Infrastructure Digitale (1A)-2025", telephone: "" },
  { matricule: "2006052300278", nom: "KETOUN", prenom: "HIBA", dateNaissance: "2006-05-23", cin: "BL178037", code: "DEV105", libelleLong: "DIA_DEV_TS_1A-Développement Digital (1A)-2025", telephone: "0772442248" },
  { matricule: "2006102300115", nom: "AYA", prenom: "ATTAR", dateNaissance: "2006-10-23", cin: "BW63101", code: "ID103", libelleLong: "DIA_ID_TS_1A-Infrastructure Digitale (1A)-2025", telephone: "0721790545" },
  { matricule: "2005062000279", nom: "ANEJJAR", prenom: "WALID", dateNaissance: "2005-06-20", cin: "BW35991", code: "DEV104", libelleLong: "DIA_DEV_TS_1A-Développement Digital (1A)-2025", telephone: "0632536155" },
  { matricule: "2003080400479", nom: "EL HAMRITI", prenom: "MOHCINE", dateNaissance: "2003-08-04", cin: "BW36736", code: "DEV101", libelleLong: "DIA_DEV_TS_1A-Développement Digital (1A)-2025", telephone: "0679385264" },
  { matricule: "2005031700306", nom: "OUASSIT", prenom: "SOUFIANE", dateNaissance: "2005-03-17", cin: "M695194", code: "DEV102", libelleLong: "DIA_DEV_TS_1A-Développement Digital (1A)-2025", telephone: "0623533912" },
  { matricule: "2007040300111", nom: "AIT ALI", prenom: "YASSER", dateNaissance: "2007-04-03", cin: "BW60657", code: "DEV102", libelleLong: "DIA_DEV_TS_1A-Développement Digital (1A)-2025", telephone: "0670939214" },
  { matricule: "2006120100272", nom: "RECHCHOUK", prenom: "AYA", dateNaissance: "2006-12-01", cin: "BW29577", code: "DEV105", libelleLong: "DIA_DEV_TS_1A-Développement Digital (1A)-2025", telephone: "0771008869" },
  { matricule: "2007102900157", nom: "BOUTTE", prenom: "MOHAMED AMINE", dateNaissance: "2007-10-29", cin: "BB252964", code: "DEV107", libelleLong: "DIA_DEV_TS_1A-Développement Digital (1A)-2025", telephone: "0602797030" },
  { matricule: "1999062000606", nom: "TAHA", prenom: "MOHAMED", dateNaissance: "1999-06-20", cin: "BK684527", code: "DEV106", libelleLong: "DIA_DEV_TS_1A-Développement Digital (1A)-2025", telephone: "" },
  { matricule: "2008010300095", nom: "NOUR", prenom: "ZAKARIA", dateNaissance: "2008-01-03", cin: "BW68484", code: "ID102", libelleLong: "DIA_ID_TS_1A-Infrastructure Digitale (1A)-2025", telephone: "0693084093" },
  { matricule: "2007040700088", nom: "AMIMER", prenom: "SALMA", dateNaissance: "2007-04-07", cin: "BF28225", code: "ID104", libelleLong: "DIA_ID_TS_1A-Infrastructure Digitale (1A)-2025", telephone: "0691331218" },
  { matricule: "2006082700321", nom: "SNAOUI", prenom: "MOUSSAAB", dateNaissance: "2006-08-27", cin: "BW63716", code: "DEV101", libelleLong: "DIA_DEV_TS_1A-Développement Digital (1A)-2025", telephone: "0621023223" },
  { matricule: "2007091700091", nom: "RGUIG ASSAKALI", prenom: "MERIEM", dateNaissance: "2007-09-17", cin: "BW74698", code: "ID102", libelleLong: "DIA_ID_TS_1A-Infrastructure Digitale (1A)-2025", telephone: "0778453125" },
  { matricule: "2007051300187", nom: "BAYENE", prenom: "CHAIMAA", dateNaissance: "2007-05-13", cin: "BH659798", code: "DEV107", libelleLong: "DIA_DEV_TS_1A-Développement Digital (1A)-2025", telephone: "0614858034" },
  { matricule: "2007081300097", nom: "LAMRANI", prenom: "SALAHEDDINE", dateNaissance: "2007-08-13", cin: "BK760425", code: "DEV106", libelleLong: "DIA_DEV_TS_1A-Développement Digital (1A)-2025", telephone: "0679764800" },
  { matricule: "2006100900252", nom: "ESSALEHY", prenom: "MOHAMED", dateNaissance: "2006-10-09", cin: "BW67332", code: "DEV103", libelleLong: "DIA_DEV_TS_1A-Développement Digital (1A)-2025", telephone: "0703539973" },
  { matricule: "2006091100325", nom: "HMANY", prenom: "ABDELLATIF", dateNaissance: "2006-09-11", cin: "BW63251", code: "DEV103", libelleLong: "DIA_DEV_TS_1A-Développement Digital (1A)-2025", telephone: "0659608218" },
  { matricule: "2007091000121", nom: "EL ASSOUL", prenom: "HIBA", dateNaissance: "2007-09-10", cin: "BW84277", code: "DEV107", libelleLong: "DIA_DEV_TS_1A-Développement Digital (1A)-2025", telephone: "0602830261" },
  { matricule: "2005081500557", nom: "BOUJRA", prenom: "HAMZA", dateNaissance: "2005-08-15", cin: "BH649894", code: "ID102", libelleLong: "DIA_ID_TS_1A-Infrastructure Digitale (1A)-2025", telephone: "0656834560" },
  { matricule: "2004101400422", nom: "MAANANE", prenom: "CHOAIB", dateNaissance: "2004-10-14", cin: "BE938300", code: "ID104", libelleLong: "DIA_ID_TS_1A-Infrastructure Digitale (1A)-2025", telephone: "0703698856" },
  { matricule: "2006071600313", nom: "MEZIOUNI", prenom: "MOHAMED RIAD", dateNaissance: "2006-07-16", cin: "BF31468", code: "DEV101", libelleLong: "DIA_DEV_TS_1A-Développement Digital (1A)-2025", telephone: "0665789552" },
  { matricule: "2006071600309", nom: "MEZIOUNI", prenom: "AHMED REDA", dateNaissance: "2006-07-16", cin: "BF31467", code: "DEV101", libelleLong: "DIA_DEV_TS_1A-Développement Digital (1A)-2025", telephone: "0665789552" },
  { matricule: "2007112600168", nom: "BEZOUI", prenom: "ANAS", dateNaissance: "2007-11-26", cin: "BK755234", code: "DEV107", libelleLong: "DIA_DEV_TS_1A-Développement Digital (1A)-2025", telephone: "" },
  { matricule: "2007042600143", nom: "ZOUHAL", prenom: "YASSER", dateNaissance: "2007-04-26", cin: "BB259703", code: "DEV106", libelleLong: "DIA_DEV_TS_1A-Développement Digital (1A)-2025", telephone: "0639623368" },
  { matricule: "2007032800203", nom: "MAARAF", prenom: "SALMA", dateNaissance: "2007-03-28", cin: "BK753023", code: "DEV105", libelleLong: "DIA_DEV_TS_1A-Développement Digital (1A)-2025", telephone: "0666340179" },
  { matricule: "2006081600321", nom: "ARAJ", prenom: "HADIYA", dateNaissance: "2006-08-16", cin: "BW58661", code: "ID104", libelleLong: "DIA_ID_TS_1A-Infrastructure Digitale (1A)-2025", telephone: "" },
  { matricule: "2008020200097", nom: "BAIDOU", prenom: "FATIMA AZZAHRA", dateNaissance: "2008-02-02", cin: "BW77743", code: "DEV105", libelleLong: "DIA_DEV_TS_1A-Développement Digital (1A)-2025", telephone: "" },
  { matricule: "2007101000135", nom: "AZNAG", prenom: "ROMAISSAE", dateNaissance: "2007-10-10", cin: "BE943089", code: "ID102", libelleLong: "DIA_ID_TS_1A-Infrastructure Digitale (1A)-2025", telephone: "" },
  { matricule: "2006092800241", nom: "ABAKYL", prenom: "YASSINE", dateNaissance: "2006-09-28", cin: "BA51504", code: "DEV102", libelleLong: "DIA_DEV_TS_1A-Développement Digital (1A)-2025", telephone: "0771921584" },
  { matricule: "2007122300064", nom: "MOSLIH", prenom: "SOUFIANE", dateNaissance: "2007-12-23", cin: "BE952138", code: "DEV103", libelleLong: "DIA_DEV_TS_1A-Développement Digital (1A)-2025", telephone: "0656698248" },
  { matricule: "2007080100248", nom: "MATICH", prenom: "ABDERRAHMAN", dateNaissance: "2007-08-01", cin: "BW87553", code: "DEV104", libelleLong: "DIA_DEV_TS_1A-Développement Digital (1A)-2025", telephone: "" },
  { matricule: "2007062200097", nom: "BANNOUR", prenom: "AYOUB", dateNaissance: "2007-06-22", cin: "BJ500397", code: "DEV102", libelleLong: "DIA_DEV_TS_1A-Développement Digital (1A)-2025", telephone: "0637333816" },
  { matricule: "2008021300127", nom: "LHABIB", prenom: "HAYTAM", dateNaissance: "2008-02-13", cin: "BW71636", code: "ID102", libelleLong: "DIA_ID_TS_1A-Infrastructure Digitale (1A)-2025", telephone: "" },
  { matricule: "2008021500105", nom: "DANINE", prenom: "FATIHA", dateNaissance: "2008-02-15", cin: "BA62894", code: "DEV103", libelleLong: "DIA_DEV_TS_1A-Développement Digital (1A)-2025", telephone: "" },
  { matricule: "2007100600136", nom: "EL MESSAFI", prenom: "YASSINE", dateNaissance: "2007-10-06", cin: "BW79116", code: "ID102", libelleLong: "DIA_ID_TS_1A-Infrastructure Digitale (1A)-2025", telephone: "" },
  { matricule: "2006092500290", nom: "JIHAR", prenom: "DOUNIA", dateNaissance: "2006-09-25", cin: "BW61909", code: "DEV107", libelleLong: "DIA_DEV_TS_1A-Développement Digital (1A)-2025", telephone: "" },
  { matricule: "2008021000113", nom: "HOUMMALY", prenom: "ABDELJALIL", dateNaissance: "2008-02-10", cin: "BH657403", code: "DEV101", libelleLong: "DIA_DEV_TS_1A-Développement Digital (1A)-2025", telephone: "0664303107" },
  { matricule: "2008012400122", nom: "SABIR", prenom: "ROMAISSAA", dateNaissance: "2008-01-24", cin: "BW75255", code: "DEV107", libelleLong: "DIA_DEV_TS_1A-Développement Digital (1A)-2025", telephone: "0702992779" },
  { matricule: "2006012900337", nom: "GUERRAB", prenom: "YOUSSEF", dateNaissance: "2006-01-29", cin: "BK754503", code: "DEV103", libelleLong: "DIA_DEV_TS_1A-Développement Digital (1A)-2025", telephone: "" },
  { matricule: "2007041500096", nom: "BOUHADRI", prenom: "LAMIAA", dateNaissance: "2007-04-15", cin: "BK767371", code: "ID104", libelleLong: "DIA_ID_TS_1A-Infrastructure Digitale (1A)-2025", telephone: "0612046987" },
  { matricule: "2007071900188", nom: "EL MOUDEN", prenom: "YOUSSEF", dateNaissance: "2007-07-19", cin: "BH658299", code: "DEV103", libelleLong: "DIA_DEV_TS_1A-Développement Digital (1A)-2025", telephone: "0717612706" },
  { matricule: "2007100700198", nom: "EL MIROUNE", prenom: "WIAM", dateNaissance: "2007-10-07", cin: "BH653777", code: "DEV102", libelleLong: "DIA_DEV_TS_1A-Développement Digital (1A)-2025", telephone: "0649415434" },
  { matricule: "2006072000349", nom: "JOUMADI", prenom: "SALAH EDDINE", dateNaissance: "2006-07-20", cin: "BW67930", code: "DEV103", libelleLong: "DIA_DEV_TS_1A-Développement Digital (1A)-2025", telephone: "0614423406" },
  { matricule: "2007080100212", nom: "HAMADA", prenom: "WALID", dateNaissance: "2007-08-01", cin: "HH136850", code: "ID103", libelleLong: "DIA_ID_TS_1A-Infrastructure Digitale (1A)-2025", telephone: "0656501752" },
  { matricule: "2007060700214", nom: "MASTOUR", prenom: "MAROUA", dateNaissance: "2007-06-07", cin: "BH659820", code: "DEV101", libelleLong: "DIA_DEV_TS_1A-Développement Digital (1A)-2025", telephone: "" },
  { matricule: "2007050500190", nom: "DJEDAINI", prenom: "SOHAIB", dateNaissance: "2007-05-05", cin: "BW71039", code: "DEV103", libelleLong: "DIA_DEV_TS_1A-Développement Digital (1A)-2025", telephone: "" },
  { matricule: "2006092100272", nom: "LAOUZ", prenom: "DOUAA", dateNaissance: "2006-09-21", cin: "BL183626", code: "DEV103", libelleLong: "DIA_DEV_TS_1A-Développement Digital (1A)-2025", telephone: "" },
  { matricule: "2007032400071", nom: "KOUNA", prenom: "HANANE", dateNaissance: "2007-03-24", cin: "BA58116", code: "ID102", libelleLong: "DIA_ID_TS_1A-Infrastructure Digitale (1A)-2025", telephone: "0669165781" },
  { matricule: "2003111500547", nom: "BOUMALEK", prenom: "HAMZA", dateNaissance: "2003-11-15", cin: "BW40233", code: "ID104", libelleLong: "DIA_ID_TS_1A-Infrastructure Digitale (1A)-2025", telephone: "0767018094" },
  { matricule: "2006081800314", nom: "AIT M'BAREK", prenom: "IBTISSAM", dateNaissance: "2006-08-18", cin: "BW61095", code: "DEV106", libelleLong: "DIA_DEV_TS_1A-Développement Digital (1A)-2025", telephone: "0664273982" },
  { matricule: "2006102100251", nom: "AFARID", prenom: "SOUFIANE", dateNaissance: "2006-10-21", cin: "BK715934", code: "DEV107", libelleLong: "DIA_DEV_TS_1A-Développement Digital (1A)-2025", telephone: "" },
  { matricule: "2003122900360", nom: "BATTOUTI", prenom: "BOUCHAIB", dateNaissance: "2003-12-29", cin: "BW39111", code: "ID101", libelleLong: "DIA_ID_TS_1A-Infrastructure Digitale (1A)-2025", telephone: "0612201288" },
  { matricule: "2004041000156", nom: "LAKHBABI", prenom: "ADAM", dateNaissance: "2004-04-10", cin: "BL176678", code: "ID101", libelleLong: "DIA_ID_TS_1A-Infrastructure Digitale (1A)-2025", telephone: "0718106776" },
  { matricule: "2006111500221", nom: "BNOU-ANAS", prenom: "MAROUANE", dateNaissance: "2006-11-15", cin: "BJ495787", code: "DEV106", libelleLong: "DIA_DEV_TS_1A-Développement Digital (1A)-2025", telephone: "" },
  { matricule: "2007092600203", nom: "KHAMMAL", prenom: "MARIA", dateNaissance: "2007-09-26", cin: "BH656310", code: "DEV104", libelleLong: "DIA_DEV_TS_1A-Développement Digital (1A)-2025", telephone: "0780514245" },
  { matricule: "2002072000538", nom: "NAIMA", prenom: "TIZRA", dateNaissance: "2002-07-20", cin: "JE318872", code: "DEV105", libelleLong: "DIA_DEV_TS_1A-Développement Digital (1A)-2025", telephone: "0707447993" },
  { matricule: "2006081300172", nom: "ELMALIANI", prenom: "IMANE", dateNaissance: "2006-08-13", cin: "BW67022", code: "DEV102", libelleLong: "DIA_DEV_TS_1A-Développement Digital (1A)-2025", telephone: "0681147052" },
  { matricule: "2007102700115", nom: "ZELBANE", prenom: "YAHYA", dateNaissance: "2007-10-27", cin: "BW82141", code: "DEV106", libelleLong: "DIA_DEV_TS_1A-Développement Digital (1A)-2025", telephone: "0657736947" },
  { matricule: "2007122600098", nom: "JANABI", prenom: "WASSILA", dateNaissance: "2007-12-26", cin: "BM61380", code: "DEV102", libelleLong: "DIA_DEV_TS_1A-Développement Digital (1A)-2025", telephone: "0604236766" },
  { matricule: "2007093000107", nom: "SAYAIH", prenom: "ANOUAR", dateNaissance: "2007-09-30", cin: "BW75328", code: "DEV104", libelleLong: "DIA_DEV_TS_1A-Développement Digital (1A)-2025", telephone: "0722363346" },
  { matricule: "2006120600224", nom: "AZAIZ", prenom: "MAROUANE", dateNaissance: "2006-12-06", cin: "BL183875", code: "DEV105", libelleLong: "DIA_DEV_TS_1A-Développement Digital (1A)-2025", telephone: "0657080691" },
  { matricule: "2007071600206", nom: "MOUHIEDDINE", prenom: "RANIA", dateNaissance: "2007-07-16", cin: "BW80886", code: "DEV101", libelleLong: "DIA_DEV_TS_1A-Développement Digital (1A)-2025", telephone: "" },
  { matricule: "2008030200116", nom: "EL FERROUNI", prenom: "KHADIJA", dateNaissance: "2008-03-02", cin: "GM267328", code: "DEV106", libelleLong: "DIA_DEV_TS_1A-Développement Digital (1A)-2025", telephone: "" },
  { matricule: "2007110600120", nom: "AIT SI AHMAD", prenom: "ILYAS", dateNaissance: "2007-11-06", cin: "BK769546", code: "DEV104", libelleLong: "DIA_DEV_TS_1A-Développement Digital (1A)-2025", telephone: "0710230801" },
  { matricule: "2007050900100", nom: "RILO", prenom: "AYMEN", dateNaissance: "2007-05-09", cin: "BK766351", code: "DEV102", libelleLong: "DIA_DEV_TS_1A-Développement Digital (1A)-2025", telephone: "0714739428" },
  { matricule: "2007030600130", nom: "EL MARZOUKI", prenom: "YAHYA", dateNaissance: "2007-03-06", cin: "BW58174", code: "ID103", libelleLong: "DIA_ID_TS_1A-Infrastructure Digitale (1A)-2025", telephone: "" },
  { matricule: "2007041700153", nom: "CHAKRANI", prenom: "SARA", dateNaissance: "2007-04-17", cin: "BK757635", code: "DEV105", libelleLong: "DIA_DEV_TS_1A-Développement Digital (1A)-2025", telephone: "0655127577" },
  { matricule: "2003022500414", nom: "DAHAB", prenom: "ABDERRAZAK", dateNaissance: "2003-02-25", cin: "BK729806", code: "IDOSR204", libelleLong: "DIA_IDOSR_TS_2A-Infrastructure Digitale option Systèmes et Réseaux (2A)-2025", telephone: "0669447131" },
  { matricule: "2007100300120", nom: "SAIH", prenom: "AYMEN", dateNaissance: "2007-10-03", cin: "BW75550", code: "DEV107", libelleLong: "DIA_DEV_TS_1A-Développement Digital (1A)-2025", telephone: "0721031671" },
  { matricule: "2003071900315", nom: "EL KORCHI", prenom: "SAAD", dateNaissance: "2003-07-19", cin: "BB230634", code: "IDOSR204", libelleLong: "DIA_IDOSR_TS_2A-Infrastructure Digitale option Systèmes et Réseaux (2A)-2025", telephone: "0612870463" },
  { matricule: "2004022700277", nom: "SOUIRGA", prenom: "FATIMA EZZAHRA", dateNaissance: "2004-02-27", cin: "BW43376", code: "IDOSR204", libelleLong: "DIA_IDOSR_TS_2A-Infrastructure Digitale option Systèmes et Réseaux (2A)-2025", telephone: "0779294374" },
  { matricule: "2005090700297", nom: "TARHAT", prenom: "ABDELLAH", dateNaissance: "2005-09-07", cin: "BW57806", code: "IDOSR204", libelleLong: "DIA_IDOSR_TS_2A-Infrastructure Digitale option Systèmes et Réseaux (2A)-2025", telephone: "0654583348" },
  { matricule: "2006030800205", nom: "MIFTAH", prenom: "ABDERRAZAK", dateNaissance: "2006-03-08", cin: "BH651299", code: "IDOSR204", libelleLong: "DIA_IDOSR_TS_2A-Infrastructure Digitale option Systèmes et Réseaux (2A)-2025", telephone: "0669254575" },
  { matricule: "2006111100090", nom: "LAHMIDI", prenom: "ABDELLAH", dateNaissance: "2006-11-11", cin: "BW56041", code: "IDOSR204", libelleLong: "DIA_IDOSR_TS_2A-Infrastructure Digitale option Systèmes et Réseaux (2A)-2025", telephone: "0666651230" },
  { matricule: "2006011000316", nom: "EL KERMI", prenom: "DOHA", dateNaissance: "2006-01-10", cin: "BW63299", code: "IDOSR204", libelleLong: "DIA_IDOSR_TS_2A-Infrastructure Digitale option Systèmes et Réseaux (2A)-2025", telephone: "0694634199" },
  { matricule: "2004110300141", nom: "DILALI", prenom: "YASSER", dateNaissance: "2004-11-03", cin: "BK735877", code: "IDOSR204", libelleLong: "DIA_IDOSR_TS_2A-Infrastructure Digitale option Systèmes et Réseaux (2A)-2025", telephone: "0707288438" },
  { matricule: "2006051300134", nom: "AAJILI", prenom: "ABDERRAFIA", dateNaissance: "2006-05-13", cin: "BW61053", code: "IDOSR204", libelleLong: "DIA_IDOSR_TS_2A-Infrastructure Digitale option Systèmes et Réseaux (2A)-2025", telephone: "0702314977" },
  { matricule: "2005121600103", nom: "LAGHLIMI", prenom: "M'HAMED", dateNaissance: "2005-12-16", cin: "bk727884", code: "IDOSR204", libelleLong: "DIA_IDOSR_TS_2A-Infrastructure Digitale option Systèmes et Réseaux (2A)-2025", telephone: "0607219909" },
  { matricule: "2006050900106", nom: "EL JAHIDI", prenom: "ABDELALI", dateNaissance: "2006-05-09", cin: "BB243161", code: "IDOSR204", libelleLong: "DIA_IDOSR_TS_2A-Infrastructure Digitale option Systèmes et Réseaux (2A)-2025", telephone: "0645026867" },
  { matricule: "2004071100283", nom: "SAADAOUI", prenom: "AYOUB", dateNaissance: "2004-07-11", cin: "BA35218", code: "IDOSR204", libelleLong: "DIA_IDOSR_TS_2A-Infrastructure Digitale option Systèmes et Réseaux (2A)-2025", telephone: "0626602963" },
  { matricule: "2006120100163", nom: "BAYROUK", prenom: "KAMIL", dateNaissance: "2006-12-01", cin: "BE943775", code: "IDOSR204", libelleLong: "DIA_IDOSR_TS_2A-Infrastructure Digitale option Systèmes et Réseaux (2A)-2025", telephone: "0705615271" },
  { matricule: "2005112100274", nom: "EL MAQDOUDY", prenom: "SAID", dateNaissance: "2005-11-21", cin: "BW51100", code: "IDOSR204", libelleLong: "DIA_IDOSR_TS_2A-Infrastructure Digitale option Systèmes et Réseaux (2A)-2025", telephone: "0690702883" },
  { matricule: "2005060400340", nom: "KHALED", prenom: "YASSER", dateNaissance: "2005-06-04", cin: "BH653061", code: "DEVOWFS203", libelleLong: "DIA_DEVOWFS_TS_2A-Développement Digital option Web Full Stack (2A)-2025", telephone: "0649783533" },
  { matricule: "2007013100107", nom: "ZAHIR", prenom: "KHADIJA", dateNaissance: "2007-01-31", cin: "BW61589", code: "DEVOWFS203", libelleLong: "DIA_DEVOWFS_TS_2A-Développement Digital option Web Full Stack (2A)-2025", telephone: "0619425799" },
  { matricule: "2005042600146", nom: "BELLALI", prenom: "MOUNA", dateNaissance: "2005-04-26", cin: "BK741181", code: "DEVOWFS203", libelleLong: "DIA_DEVOWFS_TS_2A-Développement Digital option Web Full Stack (2A)-2025", telephone: "0777890377" },
  { matricule: "2001091400467", nom: "NADDAMI", prenom: "MOHAMMED AMINE", dateNaissance: "2001-09-14", cin: "M629890", code: "ID103", libelleLong: "DIA_ID_TS_1A-Infrastructure Digitale (1A)-2025", telephone: "0661565963" },
  { matricule: "2007091200183", nom: "BENMASAOUD", prenom: "YOUNES", dateNaissance: "2007-09-12", cin: "BH658347", code: "DEV102", libelleLong: "DIA_DEV_TS_1A-Développement Digital (1A)-2025", telephone: "0651906092" },
  { matricule: "2006021500307", nom: "BASSOR", prenom: "HAMZA", dateNaissance: "2006-02-15", cin: "BH643574", code: "ID104", libelleLong: "DIA_ID_TS_1A-Infrastructure Digitale (1A)-2025", telephone: "0616795967" },
  { matricule: "2008022300061", nom: "FAKIR", prenom: "SOUHAIB", dateNaissance: "2008-02-23", cin: "BL185084", code: "DEV104", libelleLong: "DIA_DEV_TS_1A-Développement Digital (1A)-2025", telephone: "" },
  { matricule: "2008022300062", nom: "FAKIR", prenom: "SOUHAIL", dateNaissance: "2008-02-23", cin: "BL185082", code: "DEV104", libelleLong: "DIA_DEV_TS_1A-Développement Digital (1A)-2025", telephone: "0640321621" },
  { matricule: "2006050200248", nom: "FAREHAT", prenom: "HIBA", dateNaissance: "2006-05-02", cin: "BW63767", code: "DEV105", libelleLong: "DIA_DEV_TS_1A-Développement Digital (1A)-2025", telephone: "0675396703" },
  { matricule: "2008010200223", nom: "RIADI", prenom: "HIBAT-ALLAH", dateNaissance: "2008-01-02", cin: "BH652964", code: "ID103", libelleLong: "DIA_ID_TS_1A-Infrastructure Digitale (1A)-2025", telephone: "0701649914" },
  { matricule: "2005070300388", nom: "IDBOUICHOU", prenom: "AMINE", dateNaissance: "2005-07-03", cin: "BA50779", code: "ID101", libelleLong: "DIA_ID_TS_1A-Infrastructure Digitale (1A)-2025", telephone: "0710155256" },
  { matricule: "2005022600309", nom: "FOUAD", prenom: "ACHRAF", dateNaissance: "2005-02-26", cin: "BW47227", code: "DEVOWFS203", libelleLong: "DIA_DEVOWFS_TS_2A-Développement Digital option Web Full Stack (2A)-2025", telephone: "0669973483" },
  { matricule: "2007030200104", nom: "YACINE", prenom: "DINA", dateNaissance: "2007-03-02", cin: "BW27449", code: "DEVOWFS203", libelleLong: "DIA_DEVOWFS_TS_2A-Développement Digital option Web Full Stack (2A)-2025", telephone: "0694594602" },
  { matricule: "2007022700093", nom: "EL GUEBDA", prenom: "HAJAR", dateNaissance: "2007-02-27", cin: "BH652445", code: "DEVOWFS203", libelleLong: "DIA_DEVOWFS_TS_2A-Développement Digital option Web Full Stack (2A)-2025", telephone: "0642491641" },
  { matricule: "2006020200232", nom: "WAKRIM", prenom: "ILYAS", dateNaissance: "2006-02-02", cin: "BH650958", code: "DEVOWFS203", libelleLong: "DIA_DEVOWFS_TS_2A-Développement Digital option Web Full Stack (2A)-2025", telephone: "0624952737" },
  { matricule: "2006081900095", nom: "CHALLAL", prenom: "IBRAHIM", dateNaissance: "2006-08-19", cin: "BV4403", code: "DEVOWFS203", libelleLong: "DIA_DEVOWFS_TS_2A-Développement Digital option Web Full Stack (2A)-2025", telephone: "0600001716" },
  { matricule: "2006092300131", nom: "BOUKSSIM", prenom: "ABDERRAHMAN", dateNaissance: "2006-09-23", cin: "BW71766", code: "DEVOWFS203", libelleLong: "DIA_DEVOWFS_TS_2A-Développement Digital option Web Full Stack (2A)-2025", telephone: "0633864370" },
  { matricule: "2006021300187", nom: "AHMOUDAT", prenom: "YAHYA", dateNaissance: "2006-02-13", cin: "BH651009", code: "DEVOWFS203", libelleLong: "DIA_DEVOWFS_TS_2A-Développement Digital option Web Full Stack (2A)-2025", telephone: "0665973964" },
  { matricule: "2006061300154", nom: "CHAHBOUNE", prenom: "AHMED", dateNaissance: "2006-06-13", cin: "BW74102", code: "DEVOWFS203", libelleLong: "DIA_DEVOWFS_TS_2A-Développement Digital option Web Full Stack (2A)-2025", telephone: "0614630948" },
  { matricule: "2005052400339", nom: "BOUKDIR", prenom: "HOUSSAM", dateNaissance: "2005-05-24", cin: "BE943912", code: "DEVOWFS203", libelleLong: "DIA_DEVOWFS_TS_2A-Développement Digital option Web Full Stack (2A)-2025", telephone: "0632477777" },
  { matricule: "2007020800074", nom: "OUBOUHOU", prenom: "MOHAMED", dateNaissance: "2007-02-08", cin: "BF28407", code: "DEVOWFS203", libelleLong: "DIA_DEVOWFS_TS_2A-Développement Digital option Web Full Stack (2A)-2025", telephone: "0660170858" },
  { matricule: "2006040700152", nom: "LAASSIRI", prenom: "HIBA", dateNaissance: "2006-04-07", cin: "BJ475541", code: "DEVOWFS203", libelleLong: "DIA_DEVOWFS_TS_2A-Développement Digital option Web Full Stack (2A)-2025", telephone: "0694510501" },
  { matricule: "2007021300069", nom: "NACHIT", prenom: "CHOUROUK", dateNaissance: "2007-02-13", cin: "BK752910", code: "DEVOWFS203", libelleLong: "DIA_DEVOWFS_TS_2A-Développement Digital option Web Full Stack (2A)-2025", telephone: "0644811700" },
  { matricule: "2006081000228", nom: "SISSI", prenom: "HIBA", dateNaissance: "2006-08-10", cin: "WA343217", code: "DEVOWFS203", libelleLong: "DIA_DEVOWFS_TS_2A-Développement Digital option Web Full Stack (2A)-2025", telephone: "0698704046" },
  { matricule: "2006092400122", nom: "GHALLALI", prenom: "JAD", dateNaissance: "2006-09-24", cin: "BV6566", code: "DEVOWFS203", libelleLong: "DIA_DEVOWFS_TS_2A-Développement Digital option Web Full Stack (2A)-2025", telephone: "0664853360" }
];

  { matricule: "2007021000099", nom: "EL HAROUCHI", prenom: "MOHAMED", dateNaissance: "2007-02-10", cin: "BW65281", code: "DEVOWFS203", libelleLong: "DIA_DEVOWFS_TS_2A-Développement Digital option Web Full Stack (2A)-2025", telephone: "0772001108" },
  { matricule: "2006090300096", nom: "FAKHOUR", prenom: "OTHMAN", dateNaissance: "2006-09-03", cin: "BL182289", code: "DEVOWFS203", libelleLong: "DIA_DEVOWFS_TS_2A-Développement Digital option Web Full Stack (2A)-2025", telephone: "0698642023" },
  { matricule: "2006050600304", nom: "ANNAOUY", prenom: "SAID", dateNaissance: "2006-05-06", cin: "BW65350", code: "ID103", libelleLong: "DIA_ID_TS_1A-Infrastructure Digitale (1A)-2025", telephone: "0635132652" },
  { matricule: "2007072600195", nom: "AKBA", prenom: "WALID", dateNaissance: "2007-07-26", cin: "BH657697", code: "DEV104", libelleLong: "DIA_DEV_TS_1A-Développement Digital (1A)-2025", telephone: "0614517191" },
];

export async function importStudents() {
  try {
    const { data, error } = await supabase.functions.invoke('import-students', {
      body: { students: studentsToImport }
    });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Import error:', error);
    throw error;
  }
}
