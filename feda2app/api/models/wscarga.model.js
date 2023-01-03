
// WSCARGA

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const OrgModel = require('../models/org.model');

// Define collection and schema for Business
let WSCargas = new Schema({
  clientId: {type: String},
  usr: {
    _id: {type: Schema.ObjectId},
    authUserId: {type: Schema.ObjectId},
    org: { type: OrgModel.schema },
    entFed: {
      cve: {type: Number},
      cveStr: {type: String},
      nom: {type: String},
      tipo: {type: String},
      abr: {type: String},
    },
  },
  periodo: {
    yearWeek: {type: String},
    start: { type: Date },
    end: { type: Date },
    startNum: { type: Number },
    endNum: { type: Number },
  },
  fechaCarga:			{	type: Date, required: true		}	,
  d:	{
    TELEFONO	:	{	type: String	, required: true	}	,
    COD_TIPO_TELEFONO	:	{	type: Number	, required: true	}	,
    COD_MEDIO	:	{	type: Number	, required: true	}	,
    MEDIO_OTRO	:	{	type: String		}	,
    COD_IDENTIDAD	:	{	type: Number	, required: true	}	,
    IDENTIDAD_OTRO	:	{	type: String		}	,
    COD_ENT	:	{	type: String	, required: true	}	,
    COD_MUN	:	{	type: String	, required: true	}	,
    COD_TIPO_EXTORSION	:	{	type: Number	, required: true	}	,
    TIPO_EXTORSION_OTRO	:	{	type: String		}	,
    DIA_EXTORSION	:	{	type: Number	, required: true	}	,
    MES_EXTORSION	:	{	type: Number	, required: true	}	,
    ANIO_EXTORSION	:	{	type: Number	, required: true	}	,
    HORA_EXTORSION	:	{	type: Number	, required: true	}	,
    MINUTO_EXTORSION	:	{	type: Number	, required: true	}	,
    RELATO_HECHOS	:	{	type: String	, required: true	}	,
    EDAD	:	{	type: Number	, required: true	}	,
    COD_SEXO	:	{	type: Number	, required: true	}	,
    COD_BIEN_ENTREGADO	:	{	type: Number	, required: true	}	,
    BIEN_ENTREGADO_DES	:	{	type: String		}	,
    VALOR_BIEN	:	{	type: Number		}	,
    BANCO	:	{	type: String		}	,
    NO_CUENTA	:	{	type: String		}	,
    COD_DENUNCIANTE	:	{	type: Number	, required: true	}	,
    COD_INSTITUCION	:	{	type: Number	, required: true	}	,
    FOLIO_INTERNO	:	{	type: String	, required: true	}	,
    DIA_DENUNCIA	:	{	type: Number	, required: true	}	,
    MES_DENUNCIA	:	{	type: Number	, required: true	}	,
    ANIO_DENUNCIA	:	{	type: Number	, required: true	}	,
    HORA_DENUNCIA	:	{	type: Number	, required: true	}	,
    MINUTO_DENUNCIA	:	{	type: Number	, required: true	}
  }
});

module.exports = mongoose.model('wscargas', WSCargas);
