var express = require('express');
var router = express.Router();
var randomstring = require("randomstring");
var User = require("../model/user");
var nodeMailer = require("nodemailer");
var sgTransport = require("nodemailer-sendgrid-transport");
var jwt = require("jsonwebtoken");
var config = require("../config");
var multer = require("multer");
var userImages = require("../public/images/user");

// var storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, '../uploads')
//   },
//   filename: function (req, file, cb) {
//     cb(null, file.originalname + '-' + Date.now() + '.png')
//   }
// })
// var upload = multer({ storage: storage }).single('image');
// var uploadImage = (req, res, next) => {
//   console.log(req.file);
//   console.log(req.files);
//   return upload(req, res, function (err) {
//     if (err) {
//       return res.json({
//         msg: "dummy",
//         err: err
//       })
//     }
//     next();
//   })
// }


// image name formatter for multer config
var imagesHandler = function (originalFileName, folderName, newFileName) {
  var fileInfo = fs.readdirSync(folderName, 'utf8');
  return newFileName + '-' + (fileInfo.length + 1) + '.' + originalFileName.split('.').pop();
}

// multer config
var imageStorage = function (photosFolder, imageSectionString) {
  return multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, photosFolder)
    },
    filename: function (req, file, cb) {
      cb(null, imagesHandler(file.originalname, photosFolder, imageSectionString))
    }
  });
}

// defining multer's image object
var imageUpload = function (userImages, imageFolderString) {
  return multer({
    storage: imageStorage(userImages, imageFolderString)
  });
}

/*  */
router.post('/register', imageUpload(userImages, 'post-file').any(), function (req, res, next) {
  console.log(req.files);
  console.log(req.file);
  console.log(req.body);
  if (!req.body.name || !req.body.email || !req.body.password) {
    res.json({
      success: false,
      message: "enter email, name and password"
    })
  }
  User.findOne({ email: req.body.email }, function (err, doc) {
    if (doc) {
      res.json({
        status: false,
        message: "email exists.Please login"
      })
    }
    else {
      req.body.active = false;
      req.body.secretToken = randomstring.generate();
      var newUser = new User({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        active: req.body.active,
        secretToken: req.body.secretToken
        // userImageUrl: req.file
      })

      var mailOptions = {
        from: "admin,theadmin@xyz.com",
        to: req.body.email,
        subject: "xyz activation link",
        text: "Hi\n\nThank you for registering!/n/nplease click on the link to activate ur account/n/n on the following page http://www.xyz.com/verify/" + req.body.secretToken,
        html: 'Hi<br/><br/>Thank you for registering!<br/>n/nplease click on the link to activate ur account<br/><br/> on the following page<br/><br/><a href= "http://localhost:3000/user/verify?token=' + req.body.secretToken + '">http://www.xyz.com/verify</a></br></br>'
      }

      var options = {
        service: 'SendGrid',
        auth: {
          api_user: "sameera024",//sendgrid accounts username and password
          api_key: "samdaddy143"
        }
      }

      var client = nodeMailer.createTransport(sgTransport(options));
      client.sendMail(mailOptions, function (err, info) {
        if (err) {
          return console.log(err);
        } else {
          console.log(info);
        }
      });
      newUser.save(function (err, doc) {
        if (err) {
          return res.json({
            status: false,
            error: err
          })
        }
        res.json({
          status: true,
          message: "Just one more step. we have sent a link to " + req.body.email + '.Please activate your account through the link '
        })
      });
    }
  })
});

router.get("/verify", (req, res) => {
  res.setHeader('content-type', 'text/html');
  console.log(req.query.token);
  User.findOne({
    secretToken: req.query.token
  }, function (err, user) {
    if (err || !user) {
      console.log(user);
      res.json({
        status: false,
        error: err
      })
    }
    else {
      user.active = true;
      user.secretToken = "";
      user.save();
      res.render("verify");
    }
  })
})


router.post("/forgotpassword", (req, res) => {
  console.log("dd");
  User.findOne({ email: req.body.email }, function (err, user) {
    if (err) {
      res.json({
        status: false,
        error: err
      })
    }
    if (!user) {
      res.json({
        status: false,
        message: "enter a valid mail attached to ur xyz account"
      });
    }
    console.log("cc");
    var options = {
      service: 'SendGrid',
      auth: {
        api_user: "sameera024",//sendgrid accounts username and password
        api_key: "samdaddy143"
      }
    }
    var client = nodeMailer.createTransport(sgTransport(options));
    var mailOptions = {
      from: "admin,theadmin@xyz.com",
      to: user.email,
      subject: "reset password",
      text: "PLease click on the link below to reset password/n/n http://www.xyz.com/changepassword",
      html: "<br><br>Please click on the link below to change your password<br><br><a href='http://localhost:3000/user/changepassword?email=" + req.body.email + "'>http://www.xyz.com/changepassword</a>"
    }
    client.sendMail(mailOptions, function (err, info) {
      if (err) {
        return console.log(err);
      } else {
        console.log(info);
      }
    });
    res.json({
      status: true,
      message: "just one more step.We have sent you a link on" + req.body.email + "please follow the link below to change your password"
    })
  })
})

router.post("/changepassword", (req, res) => {
  res.setHeader("content-type", "text/html");
  User.findOne({ email: req.query.email }, function (err, user) {
    if (err || !user) {
      // u can also render an error page
      return res.json({
        status: false,
        message: "invalid mail"
      })
    }
    res.render("changepassword", { email: req.query.email });
  })
})

router.post("/saveChangePassword", (req, res) => {
  User.find({ email: req.body.email })
    .then((err, user) => {
      if (err) {
        res.json({ error: err });
      }
      else {
        var passwordPattern = "^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{6,16}$";
        user.comparePassword(req.body.newPassword, function (err, isMatch) {
          if (req.body.newPassword.match(passwordPattern) && !isMatch) {
            if (req.body.newPassword === req.body.confirmNewPassword) {
              user.password = req.body.newPassword;
              user.save();
              res.redirect('/');
            }
            else {
              res.send('Please make sure both the fields match');
            }
          }
          else {
            res.send('Please match the password rules');
          }
        });
      }
    });
});

router.post("/authenticate", (req, res) => {
  User.findOne({ email: req.body.email }, function (err, user) {
    if (err) {
      res.json({
        error: err
      });
    }
    if (!user) {
      res.json({
        status: false,
        message: "user is not registered!!authentication failed"
      });
    }
    else if (!user.active) {
      res.json({
        status: false,
        message: "user has not activated the account"
      });
    }
    else {
      user.comparePassword(req.body.password, function (error, isMatch) {
        if (error) {
          res.json({
            error: error
          })
        }
        if (isMatch && !error) {
          var token = jwt.sign({ userId: user._id }, config.secret, {
            expiresIn: 3600//extend time
          });
          user.token = token;
          // storeLoginSession(user,req,res);
          res.json({
            token: token,
            message: "successfully authenticated"
          })
        }
        else {
          res.json({
            status: false,
            message: " authentication failed!!password mismatch"
          })
        }
      })
    }
  })
})


router.post("/registergoogleuser", (req, res) => {
  User.find({ email: req.body.email }, function (err, docs) {
    if (err) {
      res.json({
        error: err
      })
    }
    if (docs == null || docs.length == 0) {
      if (req.body.accessToken) {
        req.body.active = true;
        req.body.secretToken = "";
        req.body.password = "vnfknv";

        var newUser = new User({
          name: req.body.name,
          email: req.body.email,
          password: req.body.password,
          active: req.body.active,
          secretToken: req.body.secretToken,
          accessToken: req.body.accessToken,
          userImageUrl: req.body.userImageUrl
        })
        newUser.save(function (err, doc) {
          if (err) {
            res.json({
              error: err
            })
          }
          // req.session.userId = doc._id;
          // storeLoginSession(newUser, req, res);
          res.json({
            message: "logged in succesfully"
          });
        });
      }
    }
    else {
      console.log("here");
      res.json({
        message: "logged in succesfully"
      });
    }
  })
})
module.exports = router;
