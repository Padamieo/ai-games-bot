module.exports = function(grunt){

  var pkg = grunt.file.readJSON('package.json');

	require("load-grunt-tasks")(grunt);

	var thisUrl = process.cwd();

	grunt.initConfig({
  	pkg: pkg,

		shell: {

	    setup: {
        command: [
					'cd ./bower_components/'+pkg.engineFolder+'/',
					'dir /b /s *.java>sources.txt',
					'md classes',
					'javac -d classes @sources.txt',
					'del sources.txt'
				].join('&&')
	    },

			compare: {
				command: [
					'cd ./bower_components/'+pkg.engineFolder+'/',
					'java -cp "lib/java-json.jar;classes" '+pkg.javaGame+' "node '+thisUrl+'/BotStarter.js" "node '+thisUrl+'/BotStarter.js" 2>err.txt 1>out.txt'
				].join('&&'),
        callback: function(err, stdout, stderr, cb) {
					console.log("done");
          cb();
        }
			}

		}

	});

	// our default task, others will come later
	grunt.registerTask("default", [
		"shell:compare"
  ]);

	grunt.registerTask('setup', [
		"shell:setup"
	]);

	grunt.registerTask('test', function(){
		console.log("try something here");
	});

};
