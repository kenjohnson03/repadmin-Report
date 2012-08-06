See LICENSE file for copyright information.

Setup for Windows Server 2008 R2

1.  Install AD DS Tools.  Located under features in the Server Manager.
2.  Install IIS.
3.  Under the default folder add a "repadmin" folder. i.e. "C:\inetpub\wwwroot\repadmin"
	a.  If this folder is not used the .bat file will need to be altered
4.  Adjust the permissions for this directory as necessary.
5.  Copy all of the files except the .bat file into the "C:\inetpub\wwwroot\repadmin" folder
6.  Save the .bat folder to any locally accessible drive.
7.  Create a task within task scheduler to run the batch file (Once per day should be more than enough).
	a.  Local Security policy -> Local Policies -> Security Options
		"Network access: Do not allow storage of passwords and credentials for network authentication."
		must be disabled
