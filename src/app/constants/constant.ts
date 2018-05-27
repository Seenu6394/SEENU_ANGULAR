import { environment } from '../../environments/environment';
export class Constants {
    public static HOST = environment.server;
    public static CHAT_URL = environment.engine;

    // CHAT
    public static CHAT_SEND_MES = Constants.CHAT_URL + '/scs/callback';

    // KU
    public static GET_ALL_KUS = Constants.HOST + 'api/getKuDetails';
    public static KNOWLEDGE_UNIT = Constants.HOST + 'api/ku';

    // SETTINGS
    public static GET_LANG = Constants.HOST + 'api/getLanguages';
    public static LANG = Constants.HOST + 'api/language';
    public static PRO_KEY = Constants.HOST + 'api/projectKeyword';
    public static PRO_KEY_DEL = Constants.HOST + 'api/deleteProjectKeyword';
    public static GET_PRO_KEY = Constants.HOST + 'api/getProjectKeywords';
    public static GET_SETTINGS = Constants.HOST + 'api/getSettings';
    public static IMPORT_SETTINGS = Constants.HOST + 'api/settingsImport';

    // INTENT
    public static GET_INTENTS_BY_KU_URL = Constants.HOST + 'api/getIntentByKu';
    public static INTENT_CHECK = Constants.CHAT_URL + '/scs/checkKeyword';
    public static INTENT_URL = Constants.HOST + 'api/intent';

    public static KEYWORD_URL = Constants.HOST + 'api/keyword';

    public static GET_ALL_ENTITY_URL = Constants.HOST + 'api/getEntityDetails';
    public static ENTITY_URL = Constants.HOST + 'api/entity';
    public static GET_ENTITY_BY_KU_URL = Constants.HOST + 'api/getEntityByKu';
    public static GET_ENTITY_TYPES_URL = Constants.HOST + 'api/getEntityTypes';
    public static ENTITY_QUESTION_URL = Constants.HOST + 'api/entityQuestion';

    public static REGEX_MAPPING = Constants.HOST + 'api/regexMapping';

    public static GET_ALL_RE_URL = Constants.HOST + 'api/getRegularExpressions';
    public static GET_ALL_INTENT_RE_URL = Constants.HOST + 'api/getIntentRegularExpressions';
    public static RE_URL = Constants.HOST + 'api/regularExpression';
    public static GET_RE_BY_KU_URL = Constants.HOST + 'api/getReByKu';

    public static INTENT_RES = Constants.HOST + 'api/intentResponse';
    public static RES_DEL = Constants.HOST + 'api/deleteResponse';
    public static UPDATE_INTENT_RES = Constants.HOST + 'api/updateResponse';

    public static GET_ALL_SA_URL = Constants.HOST + 'api/getServiceActions';
    public static SA_URL = Constants.HOST + 'api/serviceAction';
    public static GET_SA_BY_KU_URL = Constants.HOST + 'api/getSAByKu';
    public static SA_PUT = Constants.HOST + 'api/serviceActionIntent';

    public static GET_MAP_BY_KU_URL = Constants.HOST + 'api/getMappingByKu';
    public static MAP_EN_URL = Constants.HOST + 'api/mapping';
    public static MAP_REG_URL = Constants.HOST + 'api/regexmapping';
    public static MAP_REG_RE_URL = Constants.HOST + 'api/deletemappingbyReg';
    public static DEL_ERROR_RES = Constants.HOST + 'api/deleteErrorResponse';
    public static MAP_ENT_RE_URL = Constants.HOST + 'api/deletemappingbyEnt';
    public static MAP_ENT_BY_ORDER_URL = Constants.HOST + 'api/deletemappingbyOrd';
    public static MAP_REMOVE_URL = Constants.HOST + 'api/mapping';
    public static IMPORT_KU = Constants.HOST + 'api/importKu';
    public static GET_JSON = Constants.HOST + 'api/readFile';
    public static SAVE_JSON = Constants.HOST + 'api/Createku';
    public static VALIDATE_JSON = Constants.HOST + 'api/validateImport';

    public static MAP_FLOWCHART = Constants.HOST + 'api/workFlow';

    public static WORKFLOW_SEQUENCE = Constants.HOST + 'api/workFlowSequence';
    public static REMOVE_MAPPING = Constants.HOST + 'api/updateLink';
    public static REMOVE_INTENT_MAPPING = Constants.HOST + 'api/deleteIntentMappingByIntentId';

    public static LOGIN = Constants.HOST + 'login';
    public static FORGOTPASSWORD = Constants.HOST + 'api/forgotPassword';
    public static RESETPASSWORD = Constants.HOST + 'api/resetPassword';
    public static REGISTER = Constants.HOST + 'api/admin/user';
    public static CHANGEPASSWORD = Constants.HOST + 'api/changePassword';

}
