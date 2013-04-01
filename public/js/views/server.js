define(function(require) {

    var app = require('adminui');

    var Server = require('models/server');
    var NotesView = require('views/notes');
    var BaseView = require('views/base');
    var ServerTemplate = require('text!tpl/server.html');
    var TraitsModal = require('views/traits-editor');
    var JobProgressView = require('views/job-progress');
    var ChangeRackForm = require('views/server-change-rack');
    var ChangePlatformForm = require('views/server-change-platform');

    var ServerView = Backbone.Marionette.ItemView.extend({
        id: 'page-server',
        sidebar: 'servers',

        template: ServerTemplate,

        events: {
            'click .setup': 'setup',
            'click .change-rack-id': 'showChangeRackField',
            'click .change-platform': 'showChangePlatformField',
            'click .modify-traits': 'showTraitsModal',
            'click .factory-reset': 'factoryReset',
            'click .reboot': 'reboot',
            'click .forget': 'forget'
        },

        modelEvents: {
            'change': 'render'
        },

        initialize: function(options) {
            this.model = options.server || new Server();

            if (options.uuid) {
                this.model.set({uuid: options.uuid});
                this.model.fetch();
            }
        },

        templateHelpers: {
            platform_version: function() {
                return this.sysinfo['Live Image'];
            },
            cpu_type: function() {
                return this.sysinfo['CPU Type'];
            },
            cpu_physical_cores: function() {
                return this.sysinfo['CPU Physical Cores'];
            },
            cpu_total_cores: function() {
                return this.sysinfo['CPU Total Cores'];
            },
            serial_number: function() {
                return this.sysinfo['Serial Number'];
            },
            total_memory: function() {
                return this.sysinfo['MiB of Memory'];
            }
        },

        serializeData: function() {
            var data = Marionette.ItemView.prototype.serializeData.call(this);
            data.disks = _.map(data.sysinfo['Disks'], function(v, k) {
                return {name: k, size: v['Size in GB']};
            });
            data.traits = _.map(data.traits, function(v, k) {
                return {name: k, value: v};
            });
            return data;
        },

        showChangePlatformField: function() {
            var self = this;
            var $link = this.$('.platform a');
            var view = new ChangePlatformForm({model: this.model});

            this.bindTo(view, 'cancel', function() {
                $link.show();
            }, this);

            this.bindTo(view, 'save', function(platform) {
                self.model.set({boot_platform: platform});
                view.remove();
                $link.show();
            });
            this.$('.platform').append(view.el);
            $link.hide();
            view.render();
        },

        showChangeRackField: function() {
            var self = this;
            var view = new ChangeRackForm({model: this.model});
            var $link = this.$('.rack td a');

            this.bindTo(view, 'cancel', function() {
               $link.show();
            }, this);

            this.bindTo(view, 'save', function(rack) {
                self.model.set({rack_identifier: rack});
                view.remove();
                $link.show();
            });
            this.$('.rack td').append(view.el);
            $link.hide();
            view.render();
        },

        showTraitsModal: function() {
            var modal = new TraitsModal({traits: this.model.get('traits')});
            var server = this.model;
            modal.show();
            this.bindTo(modal, 'save-traits', function(traits) {
                server.set({traits: traits});
                server.update({traits: traits}, function() {
                    modal.close();
                });
            });
        },

        setup: function() {
            var server = this.model;
            var self = this;
            this.model.setup(function(job) {
                var jobView = new JobProgressView({model: job});
                jobView.show();
                self.bindTo(job, 'execution', function(status) {
                    if (status === 'succeeded') {
                        server.fetch();
                    }
                });
            });
        },

        factoryReset: function() {
            this.model.factoryReset(function(job) {
                app.vent.trigger('showjob', job);
            });
        },

        reboot: function() {
            this.model.reboot(function(job) {
                app.vent.trigger('showjob', job);
            });
        },

        forget: function() {
            this.model.forget(function(err) {
                alert('Server Removed from Datacenter');
                app.vent.trigger('showview', 'servers');
            });
        },

        onRender: function() {
            this.notesView = new NotesView({itemUuid: this.model.get('uuid'), el: this.$('.notes')});
            this.notesView.render();
        },

        url: function() {
            return _.str.sprintf('servers/%s', this.model.get('uuid'));
        }
    });

    return ServerView;
});