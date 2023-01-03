
//

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const OrgModel = require('./org.model');

// Define collection and schema for Business
let Numero = new Schema({

    TELEFONO	:	{	type: String	 	},
    IFT_TIPO_TELEFONO : {	type: String	},
    IFT_ENTIDAD : {	type: String	 	},
    IFT_MUNICIPIO : {	type: String	 	},
    IFT_CPIA : {	type: String	 	}

});

module.exports = mongoose.model('numero', Numero);
