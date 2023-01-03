

function NotUniqueValue(message){
  this.name = 'NotUniqueValue';
  this.message = message || 'El campo único está repetido';
  this.stack = (new Error()).stack;
}
NotUniqueValue.prototype = Object.create(Error.prototype);
NotUniqueValue.prototype.constructor = NotUniqueValue;

module.exports = {
  NotUniqueValue: NotUniqueValue
};
