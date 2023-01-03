
//

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const OrgModel = require('./org.model');

// Define collection and schema for Business
let Pruebas = new Schema({
  Id: {type: String},
  denuncia:	{
    TELEFONO	:	{	type: String	 	},	
    ORI_TELEFONO: { type: String	  },
    COD_TIPO_TELEFONO	:	{	type: Number },
    DES_TIPO_TELEFONO: { type: String },	
    COD_MEDIO:	{	type: Number	 	},
    DES_MEDIO:	{	type: String	 	},
    MEDIO_OTRO	:	{	type: String		},	
    COD_IDENTIDAD	:	{	type: Number	 	},
    DES_IDENTIDAD: { type: String },	
    IDENTIDAD_OTRO	:	{	type: String		},	
    COD_ENT	:	{	type: String	 	},
    DES_ENT: { type: String },	
    COD_MUN	:	{	type: String	 	},	
    DES_MUN	:	{	type: String	 	},	
    COD_TIPO_EXTORSION	:	{	type: Number	 	},
    DES_TIPO_EXTORSION	:	{	type: String	 	},	
    TIPO_EXTORSION_OTRO	:	{	type: String		},	
    DIA_EXTORSION	:	{	type: Number	 	},	
    MES_EXTORSION	:	{	type: Number	 	},	
    ANIO_EXTORSION	:	{	type: Number	 	},	
    HORA_EXTORSION	:	{	type: Number	 	},	
    MINUTO_EXTORSION	:	{	type: Number	 	},	
    RELATO_HECHOS	:	{	type: String	 	},	
    EDAD	:	{	type: Number	 	},	
    COD_SEXO	:	{	type: Number	 	},
    DES_SEXO: {	type: String		},	
    COD_BIEN_ENTREGADO	:	{	type: Number	 	},
    DES_BIEN_ENTREGADO	:	{	type: String		},		
    BIEN_ENTREGADO_DES	:	{	type: String		},	
    VALOR_BIEN	:	{	type: Number		},	
    BANCO	:	{	type: String		},	
    NO_CUENTA	:	{	type: String		},
    ORI_NO_CUENTA	:	{	type: String		},
    COD_DENUNCIANTE	:	{	type: Number	 	},
    DES_DENUNCIANTE		:	{	type: String	 	},
    COD_INSTITUCION	:	{	type: Number	 	},
    DES_INSTITUCION	:	{	type: String	 	},
    FOLIO_INTERNO	:	{	type: String	 	},	
    DIA_DENUNCIA	:	{	type: Number	 	},	
    MES_DENUNCIA	:	{	type: Number	 	},
    ANIO_DENUNCIA	:	{	type: Number	 	},	
    HORA_DENUNCIA	:	{	type: Number	 	},	
    MINUTO_DENUNCIA	:	{	type: Number	 	},
    IDENTIFICADOR : {	type: String	 	},
    IFT_TIPO_TELEFONO : {	type: String	 	},
    IFT_ENTIDAD : {	type: String	 	},
    IFT_MUNICIPIO : {	type: String	 	},
    IFT_CPIA : {	type: String	 	}
  },
  fechaCarga: { type: Date },
  fechaDenuncia: { type: Date },
  fechaExtorsion: { type: Date },
  org: {
    cveStr: { type: String },
    nom: { type: String },
    abr: { type: String },
    ent: { type: String }
  }
});

module.exports = mongoose.model('pruebas', Pruebas);
