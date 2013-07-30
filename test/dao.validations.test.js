var chai      = require('chai')
  , expect    = chai.expect
  , Sequelize = require(__dirname + '/../index')
  , Support   = require(__dirname + '/support')
  , config    = require(__dirname + '/config/config')

chai.Assertion.includeStack = true

describe(Support.getTestDialectTeaser("DaoValidator"), function() {
  describe('validations', function() {
    var checks = {
      is: {
        spec: { args: ["[a-z]",'i'] },
        fail: "0",
        pass: "a"
      },
      not: {
        spec: { args: ["[a-z]",'i'] },
        fail: "a",
        pass: "0"
      },
      isEmail : {
        fail: "a",
        pass: "abc@abc.com"
      }
    , isUrl : {
        fail: "abc",
        pass: "http://abc.com"
      }
    , isIP : {
        fail: "abc",
        pass: "129.89.23.1"
      }
    , isIPv6 : {
        fail: '1111:2222:3333::5555:',
        pass: 'fe80:0000:0000:0000:0204:61ff:fe9d:f156'
      }
    , isAlpha : {
        fail: "012",
        pass: "abc"
      }
    , isAlphanumeric : {
        fail: "_abc019",
        pass: "abc019"
      }
    , isNumeric : {
        fail: "abc",
        pass: "019"
      }
    , isInt : {
        fail: "9.2",
        pass: "-9"
      }
    , isLowercase : {
        fail: "AB",
        pass: "ab"
      }
    , isUppercase : {
        fail: "ab",
        pass: "AB"
      }
    , isDecimal : {
        fail: "a",
        pass: "0.2"
      }
    , isFloat : {
        fail: "a",
        pass: "9.2"
      }
    , notNull : {
        fail: null,
        pass: 0
      }
    , isNull : {
        fail: 0,
        pass: null
      }
    , notEmpty : {
        fail: "       ",
        pass: "a"
      }
    , equals : {
        spec : { args : "bla bla bla" },
        fail: "bla",
        pass: "bla bla bla"
      }
    , contains : {
        spec : { args : "bla" },
        fail: "la",
        pass: "0bla23"
      }
    , notContains : {
        spec : { args : "bla" },
        fail: "0bla23",
        pass: "la"
      }
    , regex : {
        spec : { args: ["[a-z]",'i'] },
        fail: "0",
        pass: "a"
      }
    , notRegex : {
        spec: { args: ["[a-z]",'i'] },
        fail: "a",
        pass: "0"
      }
    , len: {
        spec: { args: [2,4] },
        fail: ["1", "12345"],
        pass: ["12", "123", "1234"],
        raw: true
      }
    , len$: {
        spec: [2,4],
        fail: ["1", "12345"],
        pass: ["12", "123", "1234"],
        raw: true
      }
    , isUUID: {
        spec: { args: 4 },
        fail: "f47ac10b-58cc-3372-a567-0e02b2c3d479",
        pass: "f47ac10b-58cc-4372-a567-0e02b2c3d479"
      }
    , isDate: {
        fail: "not a date",
        pass: "2011-02-04"
      }
    , isAfter: {
        spec: { args: "2011-11-05" },
        fail: "2011-11-04",
        pass: "2011-11-05"
      }
    , isBefore: {
        spec: { args: "2011-11-05" },
        fail: "2011-11-06",
        pass: "2011-11-05"
      }
    , isIn: {
        spec: { args: "abcdefghijk" },
        fail: "ghik",
        pass: "ghij"
      }
    , notIn: {
        spec: { args: "abcdefghijk" },
        fail: "ghij",
        pass: "ghik"
      }
    , max: {
        spec: { args: 23 },
        fail: "24",
        pass: "23"
      }
    , max$: {
        spec: 23,
        fail: "24",
        pass: "23"
      }
    , min: {
        spec: { args: 23 },
        fail: "22",
        pass: "23"
      }
    , min$: {
        spec: 23,
        fail: "22",
        pass: "23"
      }
    , isArray: {
        fail: 22,
        pass: [22]
      }
    , isCreditCard: {
        fail: "401288888888188f",
        pass: "4012888888881881"
      }
    }

    for (var validator in checks) {
      if (checks.hasOwnProperty(validator)) {
        validator = validator.replace(/\$$/, '')

        var validatorDetails = checks[validator]

        if (!validatorDetails.hasOwnProperty("raw")) {
          validatorDetails.fail = [ validatorDetails.fail ]
          validatorDetails.pass = [ validatorDetails.pass ]
        }

        //////////////////////////
        // test the error cases //
        //////////////////////////
        for (var i = 0; i < validatorDetails.fail.length; i++) {
          var failingValue = validatorDetails.fail[i]

          it('correctly specifies an instance as invalid using a value of "' + failingValue + '" for the validation "' + validator + '"', function(done) {
            var validations = {}
              , message     = validator + "(" + failingValue + ")"

            if (validatorDetails.hasOwnProperty('spec')) {
              validations[validator] = validatorDetails.spec
            } else {
              validations[validator] = {}
            }

            validations[validator].msg = message

            var UserFail = this.sequelize.define('User' + config.rand(), {
              name: {
                type:     Sequelize.STRING,
                validate: validations
              }
            })

            var failingUser = UserFail.build({ name : failingValue })
              , errors      = failingUser.validate()

            expect(errors).not.to.be.null
            expect(errors).to.eql({ name : [message] })
            done()
          })
        }

        ////////////////////////////
        // test the success cases //
        ////////////////////////////

        for (var j = 0; j < validatorDetails.pass.length; j++) {
          var succeedingValue = validatorDetails.pass[j]

          it('correctly specifies an instance as valid using a value of "' + succeedingValue + '" for the validation "' + validator + '"', function(done) {
            var validations = {}

            if (validatorDetails.hasOwnProperty('spec')) {
              validations[validator] = validatorDetails.spec
            } else {
              validations[validator] = {}
            }

            validations[validator].msg = validator + "(" + succeedingValue + ")"

            var UserSuccess = this.sequelize.define('User' + config.rand(), {
              name: {
                type:     Sequelize.STRING,
                validate: validations
              }
            })

            var successfulUser = UserSuccess.build({ name: succeedingValue })
            expect(successfulUser.validate()).to.be.null
            done()
          })
        }
      }
    }

    it('correctly validates using custom validation methods', function(done) {
      var User = this.sequelize.define('User' + config.rand(), {
        name: {
          type: Sequelize.STRING,
          validate: {
            customFn: function(val) {
              if (val !== "2") {
                throw new Error("name should equal '2'")
              }
            }
          }
        }
      })

      var failingUser = User.build({ name : "3" })
        , errors      = failingUser.validate()

      expect(errors).not.to.be.null
      expect(errors).to.eql({ name: ["name should equal '2'"] })

      var successfulUser = User.build({ name : "2" })
      expect(successfulUser.validate()).to.be.null

      done()
    })

    it('skips other validations if allowNull is true and the value is null', function(done) {
      var User = this.sequelize.define('User' + config.rand(), {
        age: {
          type: Sequelize.INTEGER,
          allowNull: true,
          validate: {
            min: { args: 0, msg: 'must be positive' }
          }
        }
      })

      var failingUser = User.build({ age: -1 })
        , errors      = failingUser.validate()

      expect(errors).not.to.be.null
      expect(errors).to.eql({ age: ['must be positive'] })

      var successfulUser1 = User.build({ age: null })
      expect(successfulUser1.validate()).to.be.null

      var successfulUser2 = User.build({ age: 1 })
      expect(successfulUser2.validate()).to.be.null

      done()
    })

    it('validates a model with custom model-wide validation methods', function(done) {
      var Foo = this.sequelize.define('Foo' + config.rand(), {
        field1: {
          type: Sequelize.INTEGER,
          allowNull: true
        },
        field2: {
          type: Sequelize.INTEGER,
          allowNull: true
        }
      }, {
        validate: {
          xnor: function() {
            if ((this.field1 === null) === (this.field2 === null)) {
              throw new Error('xnor failed');
            }
          }
        }
      })

      var failingFoo = Foo.build({ field1: null, field2: null })
        , errors     = failingFoo.validate()

      expect(errors).not.to.be.null
      expect(errors).to.eql({ 'xnor': ['xnor failed'] })

      var successfulFoo = Foo.build({ field1: 33, field2: null })
      expect(successfulFoo.validate()).to.be.null
      done()
    })
  })
})