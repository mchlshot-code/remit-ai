<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0" 
                xmlns:html="http://www.w3.org/TR/REC-html40"
                xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
                xmlns:sitemap="http://www.sitemaps.org/schemas/sitemap/0.9"
                xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="html" version="1.0" encoding="UTF-8" indent="yes"/>
  <xsl:template match="/">
    <html xmlns="http://www.w3.org/1999/xhtml">
      <head>
        <title>RemitAI XML Sitemap</title>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
        <style type="text/css">
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
            font-size: 14px;
            color: #e2e8f0;
            background-color: #020617;
            margin: 0;
            padding: 40px;
          }
          a {
            color: #10b981;
            text-decoration: none;
            transition: color 0.2s ease-in-out;
          }
          a:hover {
            color: #34d399;
            text-decoration: underline;
          }
          #header {
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 1px solid #1e293b;
          }
          h1 {
            font-size: 24px;
            font-weight: 700;
            margin: 0 0 10px 0;
            color: #f8fafc;
            display: flex;
            align-items: center;
            gap: 12px;
          }
          .badge {
            background-color: #065f46;
            color: #a7f3d0;
            font-size: 12px;
            padding: 4px 8px;
            border-radius: 9999px;
            font-weight: 600;
          }
          p {
            margin: 0;
            color: #94a3b8;
            font-size: 15px;
            line-height: 1.5;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            background-color: #0f172a;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
            border: 1px solid #1e293b;
          }
          th {
            text-align: left;
            padding: 16px;
            font-weight: 600;
            color: #cbd5e1;
            background-color: #1e293b;
            font-size: 13px;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            border-bottom: 1px solid #334155;
          }
          td {
            padding: 14px 16px;
            border-bottom: 1px solid #1e293b;
            font-size: 14px;
          }
          tr:last-child td {
            border-bottom: none;
          }
          tr:hover td {
            background-color: #1e293b;
          }
          .url-cell {
            font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
            font-size: 13px;
          }
          .meta-cell {
            color: #94a3b8;
          }
        </style>
      </head>
      <body>
        <div id="header">
          <h1>
            RemitAI XML Sitemap
            <span class="badge">SEO Optimized</span>
          </h1>
          <p>
            This is an XML Sitemap generated dynamically for search engines to discover and index RemitAI pages.<br/>
            It contains exactly <xsl:value-of select="count(sitemap:urlset/sitemap:url)"/> URLs.
          </p>
        </div>
        <table>
          <thead>
            <tr>
              <th>URL</th>
              <th>Last Modified</th>
              <th>Change Freq</th>
              <th>Priority</th>
            </tr>
          </thead>
          <tbody>
            <xsl:for-each select="sitemap:urlset/sitemap:url">
              <tr>
                <td class="url-cell">
                  <xsl:variable name="itemURL">
                    <xsl:value-of select="sitemap:loc"/>
                  </xsl:variable>
                  <a href="{$itemURL}">
                    <xsl:value-of select="sitemap:loc"/>
                  </a>
                </td>
                <td class="meta-cell">
                  <xsl:value-of select="concat(substring(sitemap:lastmod,0,11),concat(' ', substring(sitemap:lastmod,12,5)),concat(' ', substring(sitemap:lastmod,20,6)))"/>
                </td>
                <td class="meta-cell">
                  <xsl:value-of select="sitemap:changefreq"/>
                </td>
                <td class="meta-cell">
                  <xsl:value-of select="sitemap:priority"/>
                </td>
              </tr>
            </xsl:for-each>
          </tbody>
        </table>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
