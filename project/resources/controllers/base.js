var pluralize = require("pluralize");

var router = require("express")();
module.exports = class baseController {

    constructor(model, key) {
        this.model = model,
            this.key = key,
            this.modelName = model.modelName.toLowerCase()
    }

    createNew(data) {
        return this.model.create(data)
            .then((modelInstance) => {
                var response = {};
                response[this.modelName] = modelInstance;
                return response;
            })
    }

    read(id) {
        var obj = {};
        obj[this.key] = id;
        return this.model.findOne(obj)
            .then((modelInstance) => {
                var response = {};
                response[this.modelName] = modelInstance;
                return response;
            })
    }

    list() {
        return this.model.find({})
            .limit(100)
            .then((modelInstances) => {
                var response = {};
                response[pluralize(this.modelName)] = modelInstances;
                return response;
            })
    }

    delete(id) {
        // var key = this.key;
        var obj = {};
        obj[this.key] = id;
        return this.model.remove(obj)
            .then(() => {
                return {};
            })
    }

    updateData(id, data) {
        var obj = {};
        obj[this.key] = id;
        return this.model.findOne(obj)
            .then((modelInstance) => {
                for (var attr in data) {
                    if (data.hasOwnProperty(attr) && attr !== this.key && attr !== "_id") {
                        modelInstance[attr] = data[attr];
                        console.log(modelInstance[attr]);
                    }
                }
                return modelInstance.save();
            })
            .then((modelInstance) => {
                var response = {};
                response[this.modelName] = modelInstance;
                return response;
            });

    }


    route() {
        router.get("/", (req, res) => {
            this.list()
                .then((data) => {
                    res.json(data);
                }).catch((error) => {
                    res.status(404).json({
                        error: error
                    });
                })
        });

        router.post("/", (req, res) => {
            this.createNew(req.body)
                .then((data) => {
                    res.json(data);
                })
                .catch((error) => {
                    res.status(404).json({
                        error: error
                    });
                });
        });

        router.get("/:key", (req, res) => {
            this.read(req.params.key)
                .then((data) => {
                    res.json(data);
                })
                .catch((error) => {
                    res.status(404).json({
                        error: error
                    });
                })
        });

        router.put("/:key", (req, res) => {
            // console.log(req.body);
            this.updateData(req.params.key, req.body)
                .then((data) => {
                    res.json(data);
                })
                .catch((error) => {
                    res.status(404).json({
                        error: error
                    });
                })

        });
        router.delete("/:key", (req, res) => {
            this.delete(req.params.key)
                .then((data) => {
                    res.json(data);
                })
                .catch((error) => {
                    res.status(404).json({
                        error: error
                    });
                })
        })

        return router;
    }
}