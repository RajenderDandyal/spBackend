import mongoose from 'mongoose';
import isEmpty from 'lodash/isEmpty';

import { constants } from '../constants/index';
import config from '../config/keys';

class DbCrud {
  createConnection = () => {
    return new Promise((resolve, reject) => {
      mongoose.connect(
        process.env.DATABASE,
        {
          useNewUrlParser: true,
          // server: {
          //   // sets how many times to try reconnecting
          //   reconnectTries: Number.MAX_VALUE,
          //   // sets the delay between every retry (milliseconds)
          //   reconnectInterval: 1000,
          //   socketOptions: { keepAlive: 1, connectTimeoutMS: 30000 },
          // },
          // replset: {
          //   socketOptions: { keepAlive: 1, connectTimeoutMS: 30000 },
          // },
        },
        err => {
          let responseObj = {};
          if (err) {
            responseObj.status =
              constants.dataBaseStatus.DATABASE_ERROR;
            return reject(responseObj);
          }
          responseObj.status =
            constants.dataBaseStatus.DATABASE_CONNECT;
          return resolve(responseObj);
        },
      );
    });
  };
  insertData = (Model, data) => {
    return new Promise(async (resolve, reject) => {
      try {
        let newDocument = new Model({
          ...data,
        });
        const doc = await newDocument.save();
        //console.log("insertDB==========",doc)
        if (doc) {
          let docRes;
          docRes = { message: 'Data added successfully' };
          return resolve(
            constants.responseObjSuccess(
              docRes,
              constants.dataBaseStatus.ENTITY_CREATED,
            ),
          );
        } else {
          return reject(
            constants.responseObjError(
              doc,
              constants.dataBaseStatus.ENTITY_ERROR,
            ),
          );
        }
      } catch (e) {
        console.log('Something went wrong inside: db insertData', e);
        return reject(
          constants.responseObjErrorDb(
            e,
            constants.dataBaseStatus.ENTITY_ERROR,
          ),
        );
      }
    });
  };
  find = (model, data) => {
    return new Promise(async (resolve, reject) => {
      try {
        const doc = await model.find(
          data.dbQuery,
          data.excludeFields,
          data.pagination,
        );

        if (isEmpty(doc)) {
          return resolve(
            constants.responseObjSuccess(
              [],
              constants.dataBaseStatus.DATA_NOTHING_FOUND,
            ),
          );
        } else {
          return resolve(
            constants.responseObjSuccess(
              doc,
              constants.dataBaseStatus.DATA_FETCHED,
            ),
          );
        }
      } catch (e) {
        console.log('Something went wrong inside: db find', e);
        return reject(
          constants.responseObjErrorDb(
            e,
            constants.dataBaseStatus.DATA_FETCH_ERROR,
          ),
        );
      }
    });
  };
  // by default we are updating the complete document as received from the client
  // if document have unique property on some path -- and sending the complete document to update --
  // then don't use this
  // use only if updating the unique path also along with other paths.
  updateOne = (model, data) => {
    return new Promise(async (resolve, reject) => {
      try {
        const doc = await model.findByIdAndUpdate(
          data.query,
          data.doc,
          {
            new: true,
            runValidators: false,
          },
        );
        if (isEmpty(doc)) {
          return reject(
            constants.responseObjError(
              doc,
              constants.dataBaseStatus.DATA_FETCH_ERROR,
            ),
          );
        }
        return resolve(
          constants.responseObjSuccess(
            doc,
            constants.dataBaseStatus.ENTITY_MODIFIED,
          ),
        );
      } catch (e) {
        console.log('Something went wrong inside: db updateOne', e);
        reject(
          constants.responseObjErrorDb(
            e,
            constants.dataBaseStatus.DATA_FETCH_ERROR,
          ),
        );
      }
    });
  };
  deleteOne = (model, data) => {
    return new Promise(async (resolve, reject) => {
      try {
        const doc = await model.findByIdAndRemove(data.query);

        if (isEmpty(doc)) {
          return reject(
            constants.responseObjError(
              doc,
              constants.dataBaseStatus.DATA_FETCH_ERROR,
            ),
          );
        }
        return resolve(
          constants.responseObjSuccess(
            doc,
            constants.dataBaseStatus.ENTITY_DELETED,
          ),
        );
      } catch (e) {
        console.log('Something went wrong inside: db insertData', e);
        return reject(
          constants.responseObjErrorDb(
            e,
            constants.dataBaseStatus.DATA_FETCH_ERROR,
          ),
        );
      }
    });
  };
}

export let dbCrud = new DbCrud();
export default dbCrud;
