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
					'java -cp "lib/java-json.jar;classes" '+pkg.javaGame+' "node '+thisUrl+'/main.js" "node '+thisUrl+pkg.compare+'" 2>'+pkg.outErr+' 1>'+pkg.outLog
				].join('&&'),
        callback: function(err, stdout, stderr, cb) {
					console.log("done");
          cb();
        }
			},

      random: {
        command: [
          'cd ./bower_components/'+pkg.engineFolder+'/',
          'java -cp "lib/java-json.jar;classes" '+pkg.javaGame+' "node '+thisUrl+'/main.js" "node '+thisUrl+pkg.random+'" 2>'+pkg.outErr+' 1>'+pkg.outLog
        ].join('&&'),
        callback: function(err, stdout, stderr, cb) {
          console.log("done");
          cb();
        }
      },

      reverse: {
				command: [
					'cd ./bower_components/'+pkg.engineFolder+'/',
					'java -cp "lib/java-json.jar;classes" '+pkg.javaGame+' "node '+thisUrl+pkg.compare+'" "node '+thisUrl+'/main.js" 2>'+pkg.outErr+' 1>'+pkg.outLog
				].join('&&'),
        callback: function(err, stdout, stderr, cb) {
					console.log("done");
          cb();
        }
			},

      calum: {
        command: [
          'cd ./bower_components/'+pkg.engineFolder+'/',
          'java -cp "lib/java-json.jar;classes" '+pkg.javaGame+' "python ../AiGames/mybot.py" "node '+thisUrl+'/main.js" 2>'+pkg.outErr+' 1>'+pkg.outLog
        ].join('&&'),
        callback: function(err, stdout, stderr, cb) {
          console.log("done");
          cb();
        }
      }

		},

    compress: {
      main: {
        options: {
          archive: 'bot.zip'
        },
        files: [
          {flatten: true, src: ['main.js', 'package.json', 'Move.js', 'Field.js', 'Print.js'], filter: 'isFile'}
        ]
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

  grunt.loadNpmTasks('grunt-contrib-compress');

	// default task test our bot against older version of bot
	grunt.registerTask("default", [
    "clean:log",
		"shell:compare"
  ]);

  // tests against random placement bot
  grunt.registerTask("random", [
    "clean:log",
    "shell:random"
  ]);

  // reverses default bot vs old bot player order
  grunt.registerTask('reverse', [
    "clean:log",
    "shell:reverse"
  ]);

  // test against calums bot
  grunt.registerTask('calum', [
    "clean:log",
    "shell:calum"
  ]);

  //need for setup on new machines, builds java ultimatetictactoe-engine
	grunt.registerTask('setup', [
		"shell:setup"
	]);

  //cleans up generate text files
  grunt.registerTask('clear', [
		"clean:log",
    "clean:engineOut"
	]);

  // run a serise of matches and analyses results
	grunt.registerTask('test', function(){
    matches = 100;
    score = 0;
    for (i = 0; i < matches; i++) {
      grunt.task.run(['shell:compare']);
      grunt.task.run(['analyse']);
    };
    grunt.task.run(['result']);
	});

  // reads out.txt results and adds up score
  grunt.registerTask('analyse', function() {
    var JFile = require('jfile');
    var txtFile = new JFile('./bower_components/ultimatetictactoe-engine/out.txt');
    var result = txtFile.grep("player1");
    if(result.length != 0){
      score = score + 1;
    }
  });

  // displays final score in commandline
  grunt.registerTask('result', function() {
    console.log(score+'/'+matches);
  });

  // build the bot into a zip file ready for uploading
  grunt.registerTask('deploy', [
    "compress:main"
  ]);
};
