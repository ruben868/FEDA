export interface FileBusquedaModel {

denuncia:	{
    TELEFONO	:	 String	 	,	
    ORI_TELEFONO:  String	  ,
    COD_TIPO_TELEFONO	:	 Number ,
    DES_TIPO_TELEFONO:  String ,	
    COD_MEDIO:	 Number	 	,
    DES_MEDIO:	 String	 	,
    MEDIO_OTRO	:	 String		,	
    COD_IDENTIDAD	:	 Number	 	,
    DES_IDENTIDAD:  String ,	
    IDENTIDAD_OTRO	:	 String		,	
    COD_ENT	:	 String	 	,
    DES_ENT:  String ,	
    COD_MUN	:	 String	 	,	
    DES_MUN	:	 String	 	,	
    COD_TIPO_EXTORSION	:	 Number	 	,
    DES_TIPO_EXTORSION	:	 String	 	,	
    TIPO_EXTORSION_OTRO	:	 String		,	
    DIA_EXTORSION	:	 Number	 	,	
    MES_EXTORSION	:	 Number	 	,	
    ANIO_EXTORSION	:	 Number	 	,	
    HORA_EXTORSION	:	 Number	 	,	
    MINUTO_EXTORSION	:	 Number	 	,	
    RELATO_HECHOS	:	 String	 	,	
    EDAD	:	 Number	 	,	
    COD_SEXO	:	 Number	 	,
    DES_SEXO:  String		,	
    COD_BIEN_ENTREGADO	:	 Number	 	,
    DES_BIEN_ENTREGADO	:	 String		,		
    BIEN_ENTREGADO_DES	:	 String		,	
    VALOR_BIEN	:	 Number		,	
    BANCO	:	 String		,	
    NO_CUENTA	:	 String		,
    ORI_NO_CUENTA	:	 String		,
    COD_DENUNCIANTE	:	 Number	 	,
    DES_DENUNCIANTE		:	 String	 	,
    COD_INSTITUCION	:	 Number	 	,
    DES_INSTITUCION	:	 String	 	,
    FOLIO_INTERNO	:	 String	 	,	
    DIA_DENUNCIA	:	 Number	 	,	
    MES_DENUNCIA	:	 Number	 	,
    ANIO_DENUNCIA	:	 Number	 	,	
    HORA_DENUNCIA	:	 Number	 	,	
    MINUTO_DENUNCIA	:	 Number	 	,
    IDENTIFICADOR :  String	 	,
    IFT_TIPO_TELEFONO :  String	 	,
    IFT_ENTIDAD :  String	 	,
    IFT_MUNICIPIO :  String	 	,
    IFT_CPIA :  String,
}
  fechaCarga:  Date ,
  fechaDenuncia:  Date ,
  fechaExtorsion:  Date ,
  org: {
    cveStr:  String ,
    nom:  String ,
    abr:  String ,
    ent:  String 
  
  }
 }
