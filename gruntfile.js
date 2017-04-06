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
					'java -cp "lib/java-json.jar;classes" '+pkg.javaGame+' "node '+thisUrl+'/BotStarter.js" "node '+thisUrl+pkg.compare+'" 2>'+pkg.outErr+' 1>'+pkg.outLog
				].join('&&'),
        callback: function(err, stdout, stderr, cb) {
					console.log("done");
          cb();
        }
			},

      reverse: {
				command: [
					'cd ./bower_components/'+pkg.engineFolder+'/',
					'java -cp "lib/java-json.jar;classes" '+pkg.javaGame+' "node '+thisUrl+pkg.compare+'" "node '+thisUrl+'/BotStarter.js" 2>'+pkg.outErr+' 1>'+pkg.outLog
				].join('&&'),
        callback: function(err, stdout, stderr, cb) {
					console.log("done");
          cb();
        }
			},

      calum: {
        command: [
          'cd ./bower_components/'+pkg.engineFolder+'/',
          'java -cp "lib/java-json.jar;classes" '+pkg.javaGame+' "python ../AiGames/mybot.py" "node '+thisUrl+'/BotStarter.js" 2>'+pkg.outErr+' 1>'+pkg.outLog
        ].join('&&'),
        callback: function(err, stdout, stderr, cb) {
          console.log("done");
          cb();
        }
      }

		},

    clean: {
      log: {
        src: ['output.txt']
      },
      engineOut: {
        src: [
          'bower_components/'+pkg.engineFolder+'/'+pkg.outErr,
          'bower_components/'+pkg.engineFolder+'/'+pkg.outLog,
        ]
      }
    }

	});

	// our default task, others will come later
	grunt.registerTask("default", [
    "clean:log",
		"shell:compare"
  ]);

	grunt.registerTask('setup', [
		"shell:setup"
	]);

  grunt.registerTask('clear', [
		"clean:log",
    "clean:engineOut"
	]);

  grunt.registerTask('reverse', [
    "clean:log",
    "shell:reverse"
  ]);

  grunt.registerTask('calum', [
    "clean:log",
    "shell:calum"
  ]);

	grunt.registerTask('test', function(){
		console.log("try something here");
    console.log(thisUrl+pkg.compare);
	});

};
