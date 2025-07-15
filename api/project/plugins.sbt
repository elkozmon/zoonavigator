logLevel := Level.Warn

// Play
resolvers += "Typesafe repository" at "https://repo.typesafe.com/typesafe/maven-releases/"

addSbtPlugin("com.typesafe.play" % "sbt-plugin" % "2.9.2")

// Scalafmt
addSbtPlugin("org.scalameta" % "sbt-scalafmt" % "2.5.5")

// Scalafix
addSbtPlugin("ch.epfl.scala" % "sbt-scalafix" % "0.11.1")
