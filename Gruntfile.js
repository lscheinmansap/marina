module.exports = function (grunt) {

	// Project configuration.
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		openui5_preload: {
			component: {
				options: {
					resources: [{
						cwd: 'marinaUi',
						prefix: 'graph',
						src: [
							'*.js',
							'**/*.js',
							'**/*.fragment.html',
							'**/*.fragment.json',
							'**/*.fragment.xml',
							'**/*.view.html',
							'**/*.view.json',
							'**/*.view.xml',
							'**/*.properties',
							'!openui5/**',
							'!libs/**'
						]
					}, {
						cwd: 'marinaUi/openui5/resources',
						prefix: '',
						src: [
							'sap/uxap/i18n/i18n_en_US.properties',
							'sap/uxap/i18n/i18n_en.properties',
							'sap/uxap/i18n/i18n.properties',
							'sap/suite/ui/commons/util/DateUtils.js'
						]
					}],
					dest: 'marinaUi',
					compress: true
				},
				components: {
					graph: {
						src: [
							"graph/**",
							'sap/uxap/i18n/i18n_en_US.properties',
							'sap/uxap/i18n/i18n_en.properties',
							'sap/uxap/i18n/i18n.properties',
							'sap/suite/ui/commons/util/DateUtils.js'
						]
					}
				}
			},
			library: {
				options: {
					resources: 'marinaUi/libs',
					dest: 'marinaUi/libs'
				},
				libraries: 'sap/gd'
			}
		}
	});

	grunt.loadNpmTasks('grunt-openui5');
};