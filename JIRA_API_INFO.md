Created by RJM to manage user stories in SIMP phase 2

https://docs.atlassian.com/jira/REST/cloud/#d2e308

#Obtain a search url from:
https://jira.cc.ic.ac.uk/rest/api/2/filter/11463
#To get search results from filter:
https://jira.cc.ic.ac.uk/rest/api/2/search?jql=project+%3D+SPI+AND+issuetype+%3D+Story+AND+resolution+%3D+Unresolved+ORDER+BY+priority+DESC,+updated+DESC


#My Epic query
https://jira.cc.ic.ac.uk/rest/api/2/search?jql=project+%3D+SPI+AND+issuetype+%3D+Epic+ORDER+BY+KEY

#My user story query
https://jira.cc.ic.ac.uk/rest/api/2/search?jql=project+%3D+SPI+AND+issuetype+%3D+Story+ORDER+BY+KEY

#My Task query
https://jira.cc.ic.ac.uk/rest/api/2/search?jql=project+%3D+SPI+AND+issuetype+%3D+Task+ORDER+BY+KEY


Link between tasks and user stories is task: customfield_11101 -> User Story Key
