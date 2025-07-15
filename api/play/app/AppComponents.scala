/*
 * Copyright (C) 2020  Ľuboš Kozmon <https://www.elkozmon.com>
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import api.ApiErrorHandler
import api.controllers.ApiController
import api.controllers.FrontendController
import api.routers.ApiRouter
import api.routers.ApplicationRouter
import api.routers.FrontendRouter
import com.softwaremill.macwire._
import config.ApplicationConfig
import config.PlayAssetsPath
import config.PlayHttpContext
import controllers.AssetsComponents
import curator.action.CuratorAction
import curator.provider._
import loggers.AppLogger
import monix.execution.Scheduler
import org.slf4j.LoggerFactory
import play.api.ApplicationLoader.Context
import play.api.BuiltInComponentsFromContext
import play.api.LoggerConfigurator
import play.api.http.HttpErrorHandler
import play.api.mvc.EssentialFilter
import play.api.routing.Router
import play.core.SourceMapper
import play.filters.HttpFiltersComponents
import play.filters.cors.CORSComponents

import com.elkozmon.zoonavigator.core.utils.CommonUtils._

import java.util.concurrent.TimeUnit
import scala.concurrent.duration.FiniteDuration

class AppComponents(context: Context)
    extends BuiltInComponentsFromContext(context)
    with HttpFiltersComponents
    with CORSComponents
    with AssetsComponents
    with AppModule {

  LoggerConfigurator(context.environment.classLoader)
    .foreach(_.configure(context.environment))

  lazy val playAssetsPath: PlayAssetsPath =
    PlayAssetsPath(
      configuration
        .getOptional[String]("play.assets.path")
        .get
        .stripPrefix("/")
        .stripSuffix("/")
        .prepended('/')
    )

  lazy val httpContext: PlayHttpContext =
    PlayHttpContext(
      configuration
        .getOptional[String]("play.http.context")
        .getOrElse("/")
        .stripPrefix("/")
        .stripSuffix("/")
        .prepended('/')
    )

  lazy val applicationConfig: ApplicationConfig =
    configuration.get[ApplicationConfig]("zoonavigator")

  lazy val curatorAction: CuratorAction = {
    wire[CuratorAction]
  }

  override lazy val httpErrorHandler: HttpErrorHandler = {
    // noinspection ScalaUnusedSymbol
    def routerProvider: Option[Router] = Option(router)

    // noinspection ScalaUnusedSymbol
    def sourceMapper: Option[SourceMapper] = devContext.map(_.sourceMapper)

    wire[ApiErrorHandler]
  }

  override def httpFilters: Seq[EssentialFilter] = {
    val filters = Seq.newBuilder[EssentialFilter]

    val enabledFilters = configuration
      .get[Seq[String]]("play.filters.enabled")

    if (enabledFilters.contains("play.filters.headers.SecurityHeadersFilter")) {
      appLogger.info("Enabling Filter: " + securityHeadersFilter.getClass.getName)
      (filters += securityHeadersFilter).discard()
    }

    if (enabledFilters.contains("play.filters.hosts.AllowedHostsFilter")) {
      appLogger.info("Enabling Filter: " + allowedHostsFilter.getClass.getName)
      (filters += allowedHostsFilter).discard()
    }

    if (enabledFilters.contains("play.filters.cors.CORSFilter")) {
      appLogger.info("Enabling Filter: " + corsFilter.getClass.getName)
      (filters += corsFilter).discard()
    }

    if (enabledFilters.contains("play.filters.csrf.CSRFFilter")) {
      appLogger.info("Enabling Filter: " + csrfFilter.getClass.getName)
      (filters += csrfFilter).discard()
    }

    filters.result()
  }

  override lazy val router: Router = {
    // noinspection ScalaUnusedSymbol
    val apiRouter = wire[ApiRouter]

    // noinspection ScalaUnusedSymbol
    val frontendRouter = wire[FrontendRouter]

    wire[ApplicationRouter]
  }

  lazy val akkaScheduler: Scheduler =
    Scheduler(actorSystem.dispatcher)

  lazy val curatorCacheMaxAge: CuratorCacheMaxAge =
    CuratorCacheMaxAge(
      FiniteDuration(
        context.initialConfiguration
          .getOptional[Long]("zookeeper.client.maxAge")
          .getOrElse(5000L),
        TimeUnit.MILLISECONDS
      )
    )

  lazy val curatorConnectTimeout: CuratorConnectTimeout =
    CuratorConnectTimeout(
      FiniteDuration(
        context.initialConfiguration
          .getOptional[Long]("zookeeper.client.connectTimeout")
          .getOrElse(5000L),
        TimeUnit.MILLISECONDS
      )
    )

  override val appLogger: AppLogger =
    AppLogger(LoggerFactory.getLogger("application"))

  override val curatorFrameworkProvider: CuratorFrameworkProvider =
    wire[CacheCuratorFrameworkProvider]

  override lazy val frontendController: FrontendController =
    wire[FrontendController]

  override lazy val apiController: ApiController =
    wire[ApiController]
}
