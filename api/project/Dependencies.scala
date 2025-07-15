import sbt._

object Dependencies {
  private[Dependencies] object V {
    val cats      = "2.10.0"
    val curator   = "5.8.0"
    val curatorTest = "5.8.0"
    val macwire   = "2.5.9"
    val log4j     = "2.22.1"
    val slf4j     = "2.0.9"
    val shapeless = "2.3.10"
    val monix     = "3.4.1"
    val commonsIo = "2.15.1"
    val logback   = "1.4.14"
    val jsoup     = "1.17.2"
    val scalaTest = "3.2.17"
    val scalafixOrganizeImports = "0.6.0"
  }

  val catsCore = "org.typelevel" %% "cats-core" % V.cats
  val catsFree = "org.typelevel" %% "cats-free" % V.cats

  val macwireUtil   = "com.softwaremill.macwire" %% "util"   % V.macwire
  val macwireProxy  = "com.softwaremill.macwire" %% "proxy"  % V.macwire
  val macwireMacros = "com.softwaremill.macwire" %% "macros" % V.macwire % Provided

  val curatorTest = "org.apache.curator" % "curator-test" % V.curatorTest
  val curatorFramework = "org.apache.curator" % "curator-framework" % V.curator

  val monixEval = "io.monix" %% "monix-eval" % V.monix

  val shapeless = "com.chuusai" %% "shapeless" % V.shapeless

  val commonsIo = "commons-io" % "commons-io" % V.commonsIo

  val logbackClassic = "ch.qos.logback" % "logback-classic" % V.logback

  val slf4jApi = "org.slf4j" % "slf4j-api" % V.slf4j

  val log4jApi  = "org.apache.logging.log4j" % "log4j-1.2-api" % V.log4j
  val log4jCore = "org.apache.logging.log4j" % "log4j-core"    % V.log4j

  val jsoup = "org.jsoup" % "jsoup" % V.jsoup

  val scalaTest = "org.scalatest" %% "scalatest" % V.scalaTest % Test

  val scalafixOrganizeImports = "com.github.liancheng" %% "organize-imports" % V.scalafixOrganizeImports
}
