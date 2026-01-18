/*
SQLyog Community v13.1.7 (64 bit)
MySQL - 8.0.32 : Database - univeristywork
*********************************************************************
*/

/*!40101 SET NAMES utf8 */;

/*!40101 SET SQL_MODE=''*/;

/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
CREATE DATABASE /*!32312 IF NOT EXISTS*/`univeristywork` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;

USE `univeristywork`;

/*Table structure for table `books` */

DROP TABLE IF EXISTS `books`;

CREATE TABLE `books` (
  `book_id` varchar(20) NOT NULL,
  `Title` varchar(50) DEFAULT NULL,
  `author_first_name` varchar(30) DEFAULT NULL,
  `author_last_name` varchar(30) NOT NULL,
  `Rating` decimal(3,1) DEFAULT NULL,
  PRIMARY KEY (`book_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

/*Data for the table `books` */

insert  into `books`(`book_id`,`Title`,`author_first_name`,`author_last_name`,`Rating`) values 
('A1111','Silence on the Moon','Ali','Akhtar',10.0),
('A2222','Get Rich Really Fast','Kashif','Asrar',1.0),
('A3333','Finding Inner Peace','Hameeeza','Ahmed',0.0),
('A4444','Great Mystery Stories','Nadir','Hussain',5.0),
('A5555','Software Wizardry','Umer','Iftikhar',10.0);

/*Table structure for table `patrons` */

DROP TABLE IF EXISTS `patrons`;

CREATE TABLE `patrons` (
  `patron_id` int NOT NULL,
  `last_name` varchar(30) NOT NULL,
  `first_name` varchar(30) DEFAULT NULL,
  `street_address` varchar(30) DEFAULT NULL,
  `city_state_zip` varchar(30) DEFAULT NULL,
  PRIMARY KEY (`patron_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

/*Data for the table `patrons` */

insert  into `patrons`(`patron_id`,`last_name`,`first_name`,`street_address`,`city_state_zip`) values 
(100,'Smith','Jane','123 Main Street','Mytown, MA 01234'),
(101,'Chen','William','16 S. Maple Road','Mytown, MA 01234'),
(102,'Fernandez','Maria','502 Harrison Blvd.','Sometown, NH 03078'),
(103,'Murphy','Sam','57 Main Street','Mytown, MA 01234');

/*Table structure for table `transactions` */

DROP TABLE IF EXISTS `transactions`;

CREATE TABLE `transactions` (
  `transaction_id` int NOT NULL,
  `patron_id` int DEFAULT NULL,
  `book_id` varchar(20) DEFAULT NULL,
  `transaction_data` date DEFAULT NULL,
  `transaction_type` int DEFAULT NULL,
  PRIMARY KEY (`transaction_id`),
  KEY `book_id` (`book_id`),
  KEY `fk_transactions_patron` (`patron_id`),
  CONSTRAINT `fk_transactions_patron` FOREIGN KEY (`patron_id`) REFERENCES `patrons` (`patron_id`),
  CONSTRAINT `transactions_ibfk_2` FOREIGN KEY (`book_id`) REFERENCES `books` (`book_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

/*Data for the table `transactions` */

insert  into `transactions`(`transaction_id`,`patron_id`,`book_id`,`transaction_data`,`transaction_type`) values 
(1,100,'A1111','2019-02-24',1),
(2,100,'A2222','2019-02-25',2),
(3,101,'A3333','2019-02-08',3),
(4,101,'A2222','2019-02-20',1),
(5,102,'A3333','2019-02-20',1),
(6,103,'A4444','2019-02-04',2),
(7,100,'A4444','2019-02-04',1),
(8,102,'A2222','2019-02-24',2),
(9,102,'A5555','2019-02-14',1),
(10,101,'A2222','2019-02-09',1);

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;
