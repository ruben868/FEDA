
//

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const OrgModel = require('./org.model');

// Define collection and schema for Business
let PruebaNums = new Schema({
  Id: {type: String},
Denuncia: {
    NUMS: [{ type: String }],
    NUMS_INFO: [{     TELEFONO	:	{	type: String },
      IFT_TIPO_TELEFONO : {	type: String	},
      IFT_ENTIDAD : {	type: String	 	},
      IFT_MUNICIPIO : {	type: String	 	},
      IFT_CPIA : {	type: String	 	} }],
    VALOR_BIEN	:	[{ type: Array }],
    BANCO	:	[{ type: Array }],
    NO_CUENTA	:	[{ type: Array }],
    indicador: {	type: String	 	},
    NOMBRE_COMPROBANTE: {	type: String	 	},
    SEMANA_CARGA: {	type: String	 	},
    DES_ENT: { type: String },		
    DES_MUN	:	{	type: String	 	},
    DES_TIPO_TELEFONO: { type: String },
    DES_MEDIO:	{	type: String	 	},
    DES_IDENTIDAD: { type: String },	
    DES_SEXO: {	type: String		},
    DES_BIEN_ENTREGADO	:	{	type: String		},
    DES_DENUNCIANTE		:	{	type: String	 	},
    DES_INSTITUCION	:	{	type: String	 	},
    DES_TIPO_EXTORSION	:	{	type: String	 	},
    INSTITUCION_CARGA: {	type: String		},
    ENTIDAD_CARGA: {	type: String		},
    CLAVE_INS: {	type: String		},
    FECHA_DE_CARGA: {	type: Date		},
    FECHA_DENUNCIA: {	type: Date		},
    FECHA_EXTORSION: {	type: Date		},
    COD_TIPO_TELEFONO:	{	type: Number	 	},
    COD_MEDIO:	{	type: Number	 	},
    MEDIO_OTRO:	{	type: Number	 	},
    COD_IDENTIDAD:	{	type: Number	 	},
    IDENTIDAD_OTRO:	{	type: Number	 	},
    COD_ENT:	{	type: Number	 	},
    COD_MUN:	{	type: Number	 	},
    COD_TIPO_EXTORSION	:	{	type: Number	 	},
    TIPO_EXTORSION_OTRO	:	{	type: String		},	
    DIA_EXTORSION	:	{	type: Number	 	},	
    MES_EXTORSION	:	{	type: Number	 	},	
    ANIO_EXTORSION	:	{	type: Number	 	},	
    HORA_EXTORSION	:	{	type: Number	 	},	
    MINUTO_EXTORSION	:	{	type: Number	 	},	
    RELATO_HECHOS	:	{	type: String	 	},	
    EDAD	:	{	type: Number	 	},	
    COD_SEXO	:	{	type: Number	 	},
    COD_BIEN_ENTREGADO	:	{	type: Number	 	},
    BIEN_ENTREGADO_DES	:	{	type: String		},		
    COD_DENUNCIANTE	:	{	type: Number	 	},
    COD_INSTITUCION	:	{	type: Number	 	},
    FOLIO_INTERNO	:	{	type: String	 	},	
    DIA_DENUNCIA	:	{	type: Number	 	},	
    MES_DENUNCIA	:	{	type: Number	 	},
    ANIO_DENUNCIA	:	{	type: Number	 	},	
    HORA_DENUNCIA	:	{	type: Number	 	},	
    MINUTO_DENUNCIA	:	{	type: Number	 	},
    ORI_TELEFONO	:	{	type: String		},
    ORI_COD_ENT	:	{	type: Number	 	},
    ORI_COD_MUN	:	{	type: Number	 	},
    ORI_VALOR_BIEN	:	{	type: String		},
    ORI_NO_CUENTA	:	{	type: String		}
  }

});

module.exports = mongoose.model('basenums', PruebaNums);
