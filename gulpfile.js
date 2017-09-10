var gulp = require("gulp");
var ts = require("gulp-typescript");
var tsProject = ts.createProject("tsconfig.json");
var typedoc = require("gulp-typedoc");

gulp.task("default", function() {

  var tsResult = gulp.src('src/**/*.ts')
    .pipe(tsProject());

  return tsResult
    .pipe(gulp.dest("dist"));
});

gulp.task("typedoc", function() {

  return gulp
    .src('src/**/*.ts')
    .pipe(typedoc({
      // TypeScript options (see typescript docs)
      module: "commonjs",
      target: "es5",
      includeDeclarations: true,

      // Output options (see typedoc docs)
      out: "./doc",
      // json: "output/to/file.json",

      // TypeDoc options (see typedoc docs)
      // name: "my-project",
      // theme: "/path/to/my/theme",
      // plugins: ["my", "plugins"],
      ignoreCompilerErrors: false,
      version: true,
    }))
  ;
});
