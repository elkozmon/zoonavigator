logLevel := Level.Warn

// Play
resolvers += "Typesafe repository" at "https://repo.typesafe.com/typesafe/maven-releases/"

addSbtPlugin("com.typesafe.play" % "sbt-plugin" % "2.9.11")

// Scalafmt
addSbtPlugin("org.scalameta" % "sbt-scalafmt" % "2.6.1")

// Scalafix
addSbtPlugin("ch.epfl.scala" % "sbt-scalafix" % "0.14.6")
