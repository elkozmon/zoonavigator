logLevel := Level.Warn

// Play
resolvers += "Typesafe repository" at "https://repo.typesafe.com/typesafe/maven-releases/"

addSbtPlugin("org.playframework" % "sbt-plugin" % "3.0.11")

// Scalafmt
addSbtPlugin("org.scalameta" % "sbt-scalafmt" % "2.6.1")

// Scalafix
addSbtPlugin("ch.epfl.scala" % "sbt-scalafix" % "0.14.7")
