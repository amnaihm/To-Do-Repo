//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));


mongoose.connect('mongodb+srv://amnaihm:Gs65zp2up0wHAQUE@cluster0.1h3gyfx.mongodb.net/tododb');

const itemsschema = {
  name: String
};

const Item = mongoose.model("Item", itemsschema);

const item1 = new Item({
  name: "Welcome to your to-do list!"
});
const item2 = new Item({
  name: "Hit the + button to add a new item."
});
const item3 = new Item({
  name: "<-- Hit this to delete an item."
});

const defitems = [item1, item2, item3];

const listschema = {
  name: String,
  items : [itemsschema]
}

const List = new mongoose.model("List", listschema);




app.get("/", function(req, res) {

  Item.find()
  .then(function (founditems) {

    if(founditems.length === 0){
      Item.insertMany(defitems)
      .then(function () {
      console.log("Data inserted") // Success 
      }).catch(function (error) {
      console.log(error)     // Failure 
      });
      res.redirect("/");
    }
    else{
      res.render("list", {listTitle: "Today", newListItems: founditems});
    }
   
  });
  
});

app.post("/", function(req, res){

  const itemname = req.body.newItem;
  const lname = req.body.list;

  const item = new Item({
    name: itemname
  });

  if(lname === "Today"){
    item.save();
    res.redirect("/");
  }
  else{
    List.findOne({name:lname})
    .then((result)=>{
      result.items.push(item)
      result.save();
      res.redirect("/" + lname);
    })
    .catch((err)=>{
      console.log(err);
    });
  }

  

});



app.post("/delete", function(req, res){
  const checked = req.body.checkbox;
  const listnameinput = req.body.listnameinput;

  if(listnameinput === "Today"){
    Item.findByIdAndDelete(checked)
  .then(function () {
  console.log("Data deleted")
  res.redirect("/"); // Success 
  }).catch(function (error) {
  console.log(error)     // Failure 
  });
  }
  else{
    List.findOneAndUpdate({ name: listnameinput }, { $pull: { items: { _id: checked } } })
    .then((result) => {
      if (result) {
        res.redirect("/" + listnameinput); // Success 
      }
    })
    .catch(function (error) {
      console.error(error); // Log the error
    });
  }
});





app.get("/:listname", function(req, res){
  const listname = _.capitalize(req.params.listname);

  List.findOne({ name: listname })
    .then(function (result) {
      if (!result) {
        const list = new List({
          name: listname,
          items: defitems
        });

        list.save();
        res.redirect("/" + listname);

      } else {
        res.render("list", {listTitle: result.name, newListItems: result.items});
      }
    })
    
});


app.get("/about", function(req, res){
  res.render("about");
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function() {
  console.log("Server started on port 3000");
});
