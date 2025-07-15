ThisBuild / scalaVersion := "2.13.13"

ThisBuild / scalacOptions ++= Seq(
  "-encoding",
  "UTF-8",
  "-deprecation",
  "-feature",
  "-unchecked",
  "-Xlint:adapted-args,inaccessible",
  "-Wvalue-discard",
  "-Wunused",
  "-Wdead-code"
)

ThisBuild / semanticdbEnabled := true
ThisBuild / semanticdbVersion := scalafixSemanticdb.revision
ThisBuild / scalafixDependencies += Dependencies.scalafixOrganizeImports

val commonSettings = Seq(
  organization := "com.elkozmon",
  licenses += ("GNU Affero GPL V3", url("http://www.gnu.org/licenses/agpl-3.0.html")),
  developers := List(
    Developer(
      id = "elkozmon",
      name = "Ľuboš Kozmon",
      email = "contact@elkozmon.com",
      url = url("http://www.elkozmon.com")
    )
  ),
  libraryDependencies ++= Seq(
    Dependencies.catsCore,
    Dependencies.catsFree,
    Dependencies.scalaTest
  )
)

val core = project
  .settings(commonSettings: _*)
  .settings(
    name := "zoonavigator-core",
    libraryDependencies ++= Seq(
      Dependencies.slf4jApi,
      Dependencies.curatorFramework,
      Dependencies.curatorTest,
      Dependencies.zookeeper,
      Dependencies.log4jApi,
      Dependencies.log4jCore,
      Dependencies.monixEval,
      Dependencies.shapeless
    )
  )

val play = project
  .enablePlugins(PlayScala)
  .settings(commonSettings: _*)
  .settings(
    name := "zoonavigator-play",
    libraryDependencies ++= Seq(
      filters,
      Dependencies.commonsIo,
      Dependencies.logbackClassic,
      Dependencies.zookeeper,
      Dependencies.macwireUtil,
      Dependencies.macwireProxy,
      Dependencies.macwireMacros,
      Dependencies.jsoup
    ),
    routesImport ++= Seq(
      "api.binders._",
      "com.elkozmon.zoonavigator.core.zookeeper.znode.ZNodePath",
      "com.elkozmon.zoonavigator.core.zookeeper.znode.ZNodeAclVersion",
      "com.elkozmon.zoonavigator.core.zookeeper.znode.ZNodeDataVersion"
    ),
    Compile / doc / sources                := Seq.empty,
    Compile / packageDoc / publishArtifact := false,
    scriptClasspath in bashScriptDefines ~= (cp => "zookeeper.jar" +: cp)
  )
  .dependsOn(core)
