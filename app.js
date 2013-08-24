$(window).load(function(){
(function () {
    var Item = Backbone.Model.extend({
        defaults: {title: '',
                   done: false}
    });
    
    var viewTmpl = _.template(
        '<a href="#details-page" class="done-<%= done %>"><%= title %></a>');
    
    var ItemView = Backbone.View.extend({
        tagName: 'li',
        events: {
            'click': 'jobEdit'
        },
        initialize: function (model, detailsView) {
            this.model = model;
            this.detailsView = detailsView;
            _.bindAll(this, 'render', 'jobEdit');
        },
        render: function () {
            this.$el.html(viewTmpl({
                title: this.model.get('title'),
                done: this.model.get('done')
            }));
            return this.$el;
        },
        jobEdit: function () {
            this.detailsView.setModel(this.model);
            this.detailsView.render();
            $('ul').listview('refresh');
        }
    });
    
    var DetailsView = Backbone.View.extend({
        el: $('#details-content'),
        initialize: function (parent) {
            this.parent = parent;
            _.bindAll(this, 'saveTask', 'deleteTask');
            var _this = this;
            $('#save').click(function () {
                _this.saveTask();
            });
            $('#delete').click(function () {
                _this.deleteTask();
            });
        },
        setModel: function (model) {
            this.model = model;
        },
        render: function () {
            $('#details-title').val(
                this.model.get('title')
            );
            return this.$el;
        },
        saveTask: function () {
            var newTitle = $('#details-title').val();
            if (newTitle == '')
                return;
            this.model.set('title', newTitle);
            $('#goback').click();
            this.parent.render();
        },
        deleteTask: function () {
            this.parent.removeModel(this.model);
            $('#goback').click();
            this.parent.render();
        }
    });
    
    var ItemCollection = Backbone.Collection.extend({
        model: Item
    });
   
    var ListView = Backbone.View.extend({
        el: $('#app-view'),
        events: {
            'click button#add': 'addTask',
            'click button#saveList': 'saveList'
        },
        initialize: function () {
            _.bindAll(this, 'render', 'addTask', 'removeModel', 'saveList');
            this.models = this.loadList();
            this.detailsView = new DetailsView(this);
            this.models.bind('add', this.render);
            this.render();
        },
        render: function () {
            $('#master-list').html('');
            var detailsView = this.detailsView;
            this.models.forEach(function (m) {
                var view = new ItemView(m,
                                        detailsView);
                $('#master-list').append(view.render());
            });
            $('ul').listview('refresh');
            this.saveList();
        },
        addTask: function () {
            var task = $('#task').val();
            if (task == '')
                return;
            this.models.add(new Item({
                title: task
            }));
            $('#task').val('');
        },
        removeModel: function (model) {
            this.models.remove(model);
        },
        saveList: function () {
            if (localStorage) {
                localStorage.tasks = JSON.stringify(this.models);
            }
        },
        loadList: function () {
            var models = new ItemCollection();
            if (localStorage) {
                if (localStorage.tasks) {
                    models = new ItemCollection(JSON.parse(localStorage.tasks));
                }
            }
            return models;
        }
    });
    
    new ListView();
})();
});