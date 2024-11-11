-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Nov 11, 2024 at 10:23 AM
-- Server version: 10.4.25-MariaDB
-- PHP Version: 8.1.10

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `ppi`
--

-- --------------------------------------------------------

--
-- Table structure for table `apps`
--

CREATE TABLE `apps` (
  `id` int(11) NOT NULL,
  `name` varchar(50) NOT NULL,
  `url` varchar(50) NOT NULL,
  `description` varchar(50) DEFAULT NULL,
  `icon` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `apps`
--

INSERT INTO `apps` (`id`, `name`, `url`, `description`, `icon`) VALUES
(1, 'Next Cloud', 'http://172.18.121.101', 'Next Cloud', NULL),
(2, 'LMS', 'https://lms.pmdmc.net/', 'Letter Management System', ''),
(3, 'PV Inventory', 'https://pvinv.pmdmc.net/PVLogs', 'PV Inventory', ''),
(4, 'INC Hymns', 'http://172.18.121.5', 'INC Hymns', ''),
(5, 'PMD Media', 'http://172.18.121.48/', 'PMD Media', ''),
(6, 'Choir App', 'https://google.com', 'Choir App', ''),
(7, 'Suguan', 'http://172.18.125.134:3000/add-suguan', 'WS Suguan', NULL),
(8, 'Snipe IT', 'https://pvinv.pmdmc.net', 'Snipe IT', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `available_apps`
--

CREATE TABLE `available_apps` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `app_id` int(11) NOT NULL,
  `ldap_group_cn` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `available_apps`
--

INSERT INTO `available_apps` (`id`, `user_id`, `app_id`, `ldap_group_cn`) VALUES
(55, 47, 1, ''),
(56, 48, 1, ''),
(57, 48, 2, ''),
(58, 48, 3, ''),
(59, 48, 4, ''),
(60, 48, 5, ''),
(61, 48, 6, ''),
(62, 48, 7, ''),
(63, 48, 8, ''),
(64, 46, 1, ''),
(65, 46, 2, ''),
(66, 46, 3, ''),
(67, 46, 4, ''),
(68, 46, 8, '');

-- --------------------------------------------------------

--
-- Table structure for table `children`
--

CREATE TABLE `children` (
  `id` bigint(20) NOT NULL,
  `personnel_id` bigint(20) NOT NULL,
  `firstname` varchar(50) NOT NULL,
  `secondname` varchar(50) DEFAULT NULL,
  `middlname` text DEFAULT NULL,
  `lastname` varchar(50) NOT NULL,
  `suffix` text DEFAULT NULL,
  `date_of_birth` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `citizenships`
--

CREATE TABLE `citizenships` (
  `id` int(11) NOT NULL,
  `country_name` varchar(100) NOT NULL,
  `citizenship` varchar(100) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `citizenships`
--

INSERT INTO `citizenships` (`id`, `country_name`, `citizenship`, `created_at`, `updated_at`) VALUES
(1, 'Afghanistan', 'Afghan', '2024-11-11 08:30:29', '2024-11-11 08:30:29'),
(2, 'Albania', 'Albanian', '2024-11-11 08:30:29', '2024-11-11 08:30:29'),
(3, 'Algeria', 'Algerian', '2024-11-11 08:30:29', '2024-11-11 08:30:29'),
(4, 'Andorra', 'Andorran', '2024-11-11 08:30:29', '2024-11-11 08:30:29'),
(5, 'Angola', 'Angolan', '2024-11-11 08:30:29', '2024-11-11 08:30:29'),
(6, 'Antigua and Barbuda', 'Antiguan or Barbudan', '2024-11-11 08:30:29', '2024-11-11 08:30:29'),
(7, 'Argentina', 'Argentine', '2024-11-11 08:30:29', '2024-11-11 08:30:29'),
(8, 'Armenia', 'Armenian', '2024-11-11 08:30:29', '2024-11-11 08:30:29'),
(9, 'Australia', 'Australian', '2024-11-11 08:30:29', '2024-11-11 08:30:29'),
(10, 'Austria', 'Austrian', '2024-11-11 08:30:29', '2024-11-11 08:30:29'),
(11, 'Azerbaijan', 'Azerbaijani', '2024-11-11 08:30:29', '2024-11-11 08:30:29'),
(12, 'Bahamas', 'Bahamian', '2024-11-11 08:30:29', '2024-11-11 08:30:29'),
(13, 'Bahrain', 'Bahraini', '2024-11-11 08:30:29', '2024-11-11 08:30:29'),
(14, 'Bangladesh', 'Bangladeshi', '2024-11-11 08:30:29', '2024-11-11 08:30:29'),
(15, 'Barbados', 'Barbadian', '2024-11-11 08:30:29', '2024-11-11 08:30:29'),
(16, 'Belarus', 'Belarusian', '2024-11-11 08:30:29', '2024-11-11 08:30:29'),
(17, 'Belgium', 'Belgian', '2024-11-11 08:30:29', '2024-11-11 08:30:29'),
(18, 'Belize', 'Belizean', '2024-11-11 08:30:29', '2024-11-11 08:30:29'),
(19, 'Benin', 'Beninese', '2024-11-11 08:30:29', '2024-11-11 08:30:29'),
(20, 'Bhutan', 'Bhutanese', '2024-11-11 08:30:29', '2024-11-11 08:30:29'),
(21, 'Bolivia', 'Bolivian', '2024-11-11 08:30:29', '2024-11-11 08:30:29'),
(22, 'Bosnia and Herzegovina', 'Bosnian', '2024-11-11 08:30:29', '2024-11-11 08:30:29'),
(23, 'Botswana', 'Botswana', '2024-11-11 08:30:29', '2024-11-11 08:30:29'),
(24, 'Brazil', 'Brazilian', '2024-11-11 08:30:29', '2024-11-11 08:30:29'),
(25, 'Brunei', 'Bruneian', '2024-11-11 08:30:29', '2024-11-11 08:30:29'),
(26, 'Bulgaria', 'Bulgarian', '2024-11-11 08:30:29', '2024-11-11 08:30:29'),
(27, 'Burkina Faso', 'Burkinabe', '2024-11-11 08:30:29', '2024-11-11 08:30:29'),
(28, 'Burundi', 'Burundian', '2024-11-11 08:30:29', '2024-11-11 08:30:29'),
(29, 'Cabo Verde', 'Cape Verdean', '2024-11-11 08:30:29', '2024-11-11 08:30:29'),
(30, 'Cambodia', 'Cambodian', '2024-11-11 08:30:29', '2024-11-11 08:30:29'),
(31, 'Cameroon', 'Cameroonian', '2024-11-11 08:30:29', '2024-11-11 08:30:29'),
(32, 'Canada', 'Canadian', '2024-11-11 08:30:29', '2024-11-11 08:30:29'),
(33, 'Central African Republic', 'Central African', '2024-11-11 08:30:29', '2024-11-11 08:30:29'),
(34, 'Chad', 'Chadian', '2024-11-11 08:30:29', '2024-11-11 08:30:29'),
(35, 'Chile', 'Chilean', '2024-11-11 08:30:29', '2024-11-11 08:30:29'),
(36, 'China', 'Chinese', '2024-11-11 08:30:29', '2024-11-11 08:30:29'),
(37, 'Colombia', 'Colombian', '2024-11-11 08:30:29', '2024-11-11 08:30:29'),
(38, 'Comoros', 'Comoran', '2024-11-11 08:30:29', '2024-11-11 08:30:29'),
(39, 'Congo, Democratic Republic of the', 'Congolese', '2024-11-11 08:30:29', '2024-11-11 08:30:29'),
(40, 'Congo, Republic of the', 'Congolese', '2024-11-11 08:30:29', '2024-11-11 08:30:29'),
(41, 'Costa Rica', 'Costa Rican', '2024-11-11 08:30:29', '2024-11-11 08:30:29'),
(42, 'Croatia', 'Croatian', '2024-11-11 08:30:29', '2024-11-11 08:30:29'),
(43, 'Cuba', 'Cuban', '2024-11-11 08:30:29', '2024-11-11 08:30:29'),
(44, 'Cyprus', 'Cypriot', '2024-11-11 08:30:29', '2024-11-11 08:30:29'),
(45, 'Czech Republic', 'Czech', '2024-11-11 08:30:29', '2024-11-11 08:30:29'),
(46, 'Denmark', 'Danish', '2024-11-11 08:30:29', '2024-11-11 08:30:29'),
(47, 'Djibouti', 'Djiboutian', '2024-11-11 08:30:29', '2024-11-11 08:30:29'),
(48, 'Dominica', 'Dominican', '2024-11-11 08:30:29', '2024-11-11 08:30:29'),
(49, 'Dominican Republic', 'Dominican', '2024-11-11 08:30:29', '2024-11-11 08:30:29'),
(50, 'Ecuador', 'Ecuadorian', '2024-11-11 08:30:29', '2024-11-11 08:30:29'),
(51, 'Egypt', 'Egyptian', '2024-11-11 08:30:29', '2024-11-11 08:30:29'),
(52, 'El Salvador', 'Salvadoran', '2024-11-11 08:30:29', '2024-11-11 08:30:29'),
(53, 'Equatorial Guinea', 'Equatoguinean', '2024-11-11 08:30:29', '2024-11-11 08:30:29'),
(54, 'Eritrea', 'Eritrean', '2024-11-11 08:30:29', '2024-11-11 08:30:29'),
(55, 'Estonia', 'Estonian', '2024-11-11 08:30:29', '2024-11-11 08:30:29'),
(56, 'Eswatini', 'Swazi', '2024-11-11 08:30:29', '2024-11-11 08:30:29'),
(57, 'Ethiopia', 'Ethiopian', '2024-11-11 08:30:29', '2024-11-11 08:30:29'),
(58, 'Fiji', 'Fijian', '2024-11-11 08:30:29', '2024-11-11 08:30:29'),
(59, 'Finland', 'Finnish', '2024-11-11 08:30:29', '2024-11-11 08:30:29'),
(60, 'France', 'French', '2024-11-11 08:30:29', '2024-11-11 08:30:29'),
(61, 'Gabon', 'Gabonese', '2024-11-11 08:30:29', '2024-11-11 08:30:29'),
(62, 'Gambia', 'Gambian', '2024-11-11 08:30:29', '2024-11-11 08:30:29'),
(63, 'Georgia', 'Georgian', '2024-11-11 08:30:29', '2024-11-11 08:30:29'),
(64, 'Germany', 'German', '2024-11-11 08:30:29', '2024-11-11 08:30:29'),
(65, 'Ghana', 'Ghanaian', '2024-11-11 08:30:29', '2024-11-11 08:30:29'),
(66, 'Greece', 'Greek', '2024-11-11 08:30:29', '2024-11-11 08:30:29'),
(67, 'Grenada', 'Grenadian', '2024-11-11 08:30:29', '2024-11-11 08:30:29'),
(68, 'Guatemala', 'Guatemalan', '2024-11-11 08:30:29', '2024-11-11 08:30:29'),
(69, 'Guinea', 'Guinean', '2024-11-11 08:30:29', '2024-11-11 08:30:29'),
(70, 'Guinea-Bissau', 'Guinea-Bissauan', '2024-11-11 08:30:29', '2024-11-11 08:30:29'),
(71, 'Guyana', 'Guyanese', '2024-11-11 08:30:29', '2024-11-11 08:30:29'),
(72, 'Haiti', 'Haitian', '2024-11-11 08:30:29', '2024-11-11 08:30:29'),
(73, 'Honduras', 'Honduran', '2024-11-11 08:30:29', '2024-11-11 08:30:29'),
(74, 'Hungary', 'Hungarian', '2024-11-11 08:30:29', '2024-11-11 08:30:29'),
(75, 'Iceland', 'Icelander', '2024-11-11 08:30:29', '2024-11-11 08:30:29'),
(76, 'India', 'Indian', '2024-11-11 08:30:29', '2024-11-11 08:30:29'),
(77, 'Indonesia', 'Indonesian', '2024-11-11 08:30:29', '2024-11-11 08:30:29'),
(78, 'Iran', 'Iranian', '2024-11-11 08:30:29', '2024-11-11 08:30:29'),
(79, 'Iraq', 'Iraqi', '2024-11-11 08:30:29', '2024-11-11 08:30:29'),
(80, 'Ireland', 'Irish', '2024-11-11 08:30:29', '2024-11-11 08:30:29'),
(81, 'Israel', 'Israeli', '2024-11-11 08:30:29', '2024-11-11 08:30:29'),
(82, 'Italy', 'Italian', '2024-11-11 08:30:29', '2024-11-11 08:30:29'),
(83, 'Jamaica', 'Jamaican', '2024-11-11 08:30:29', '2024-11-11 08:30:29'),
(84, 'Japan', 'Japanese', '2024-11-11 08:30:29', '2024-11-11 08:30:29'),
(85, 'Jordan', 'Jordanian', '2024-11-11 08:30:29', '2024-11-11 08:30:29'),
(86, 'Kazakhstan', 'Kazakhstani', '2024-11-11 08:30:29', '2024-11-11 08:30:29'),
(87, 'Kenya', 'Kenyan', '2024-11-11 08:30:29', '2024-11-11 08:30:29'),
(88, 'Kiribati', 'I-Kiribati', '2024-11-11 08:30:29', '2024-11-11 08:30:29'),
(89, 'Korea, North', 'North Korean', '2024-11-11 08:30:29', '2024-11-11 08:30:29'),
(90, 'Korea, South', 'South Korean', '2024-11-11 08:30:29', '2024-11-11 08:30:29'),
(91, 'Kuwait', 'Kuwaiti', '2024-11-11 08:30:29', '2024-11-11 08:30:29'),
(92, 'Kyrgyzstan', 'Kyrgyzstani', '2024-11-11 08:30:29', '2024-11-11 08:30:29'),
(93, 'Laos', 'Laotian', '2024-11-11 08:30:29', '2024-11-11 08:30:29'),
(94, 'Latvia', 'Latvian', '2024-11-11 08:30:29', '2024-11-11 08:30:29'),
(95, 'Lebanon', 'Lebanese', '2024-11-11 08:30:29', '2024-11-11 08:30:29'),
(96, 'Lesotho', 'Mosotho', '2024-11-11 08:30:29', '2024-11-11 08:30:29'),
(97, 'Liberia', 'Liberian', '2024-11-11 08:30:29', '2024-11-11 08:30:29'),
(98, 'Libya', 'Libyan', '2024-11-11 08:30:29', '2024-11-11 08:30:29'),
(99, 'Liechtenstein', 'Liechtensteiner', '2024-11-11 08:30:29', '2024-11-11 08:30:29'),
(100, 'Lithuania', 'Lithuanian', '2024-11-11 08:30:29', '2024-11-11 08:30:29'),
(101, 'Luxembourg', 'Luxembourger', '2024-11-11 08:30:29', '2024-11-11 08:30:29'),
(102, 'Madagascar', 'Malagasy', '2024-11-11 08:30:29', '2024-11-11 08:30:29'),
(103, 'Malawi', 'Malawian', '2024-11-11 08:30:29', '2024-11-11 08:30:29'),
(104, 'Malaysia', 'Malaysian', '2024-11-11 08:30:29', '2024-11-11 08:30:29'),
(105, 'Maldives', 'Maldivian', '2024-11-11 08:30:29', '2024-11-11 08:30:29'),
(106, 'Mali', 'Malian', '2024-11-11 08:30:29', '2024-11-11 08:30:29'),
(107, 'Malta', 'Maltese', '2024-11-11 08:30:29', '2024-11-11 08:30:29'),
(108, 'Marshall Islands', 'Marshallese', '2024-11-11 08:30:29', '2024-11-11 08:30:29'),
(109, 'Mauritania', 'Mauritanian', '2024-11-11 08:30:29', '2024-11-11 08:30:29'),
(110, 'Mauritius', 'Mauritian', '2024-11-11 08:30:29', '2024-11-11 08:30:29'),
(111, 'Mexico', 'Mexican', '2024-11-11 08:30:29', '2024-11-11 08:30:29'),
(112, 'Micronesia', 'Micronesian', '2024-11-11 08:30:29', '2024-11-11 08:30:29'),
(113, 'Moldova', 'Moldovan', '2024-11-11 08:30:29', '2024-11-11 08:30:29'),
(114, 'Monaco', 'Monacan', '2024-11-11 08:30:29', '2024-11-11 08:30:29'),
(115, 'Mongolia', 'Mongolian', '2024-11-11 08:30:29', '2024-11-11 08:30:29'),
(116, 'Montenegro', 'Montenegrin', '2024-11-11 08:30:29', '2024-11-11 08:30:29'),
(117, 'Morocco', 'Moroccan', '2024-11-11 08:30:29', '2024-11-11 08:30:29'),
(118, 'Mozambique', 'Mozambican', '2024-11-11 08:30:29', '2024-11-11 08:30:29'),
(119, 'Myanmar', 'Burmese', '2024-11-11 08:30:29', '2024-11-11 08:30:29'),
(120, 'Namibia', 'Namibian', '2024-11-11 08:30:29', '2024-11-11 08:30:29'),
(121, 'Nauru', 'Nauruan', '2024-11-11 08:30:29', '2024-11-11 08:30:29'),
(122, 'Nepal', 'Nepalese', '2024-11-11 08:30:29', '2024-11-11 08:30:29'),
(123, 'Netherlands', 'Dutch', '2024-11-11 08:30:29', '2024-11-11 08:30:29'),
(124, 'New Zealand', 'New Zealander', '2024-11-11 08:30:29', '2024-11-11 08:30:29'),
(125, 'Nicaragua', 'Nicaraguan', '2024-11-11 08:30:29', '2024-11-11 08:30:29'),
(126, 'Niger', 'Nigerien', '2024-11-11 08:30:29', '2024-11-11 08:30:29'),
(127, 'Nigeria', 'Nigerian', '2024-11-11 08:30:29', '2024-11-11 08:30:29'),
(128, 'North Macedonia', 'Macedonian', '2024-11-11 08:30:29', '2024-11-11 08:30:29'),
(129, 'Norway', 'Norwegian', '2024-11-11 08:30:29', '2024-11-11 08:30:29'),
(130, 'Oman', 'Omani', '2024-11-11 08:30:29', '2024-11-11 08:30:29'),
(131, 'Pakistan', 'Pakistani', '2024-11-11 08:30:29', '2024-11-11 08:30:29'),
(132, 'Palau', 'Palauan', '2024-11-11 08:30:29', '2024-11-11 08:30:29'),
(133, 'Palestine', 'Palestinian', '2024-11-11 08:30:29', '2024-11-11 08:30:29'),
(134, 'Panama', 'Panamanian', '2024-11-11 08:30:29', '2024-11-11 08:30:29'),
(135, 'Papua New Guinea', 'Papua New Guinean', '2024-11-11 08:30:29', '2024-11-11 08:30:29'),
(136, 'Paraguay', 'Paraguayan', '2024-11-11 08:30:29', '2024-11-11 08:30:29'),
(137, 'Peru', 'Peruvian', '2024-11-11 08:30:29', '2024-11-11 08:30:29'),
(138, 'Philippines', 'Filipino', '2024-11-11 08:30:29', '2024-11-11 08:30:29'),
(139, 'Poland', 'Polish', '2024-11-11 08:30:29', '2024-11-11 08:30:29'),
(140, 'Portugal', 'Portuguese', '2024-11-11 08:30:29', '2024-11-11 08:30:29'),
(141, 'Qatar', 'Qatari', '2024-11-11 08:30:29', '2024-11-11 08:30:29'),
(142, 'Romania', 'Romanian', '2024-11-11 08:30:29', '2024-11-11 08:30:29'),
(143, 'Russia', 'Russian', '2024-11-11 08:30:29', '2024-11-11 08:30:29'),
(144, 'Rwanda', 'Rwandan', '2024-11-11 08:30:29', '2024-11-11 08:30:29'),
(145, 'Saint Kitts and Nevis', 'Kittitian or Nevisian', '2024-11-11 08:30:29', '2024-11-11 08:30:29'),
(146, 'Saint Lucia', 'Saint Lucian', '2024-11-11 08:30:29', '2024-11-11 08:30:29'),
(147, 'Saint Vincent and the Grenadines', 'Saint Vincentian', '2024-11-11 08:30:29', '2024-11-11 08:30:29'),
(148, 'Samoa', 'Samoan', '2024-11-11 08:30:29', '2024-11-11 08:30:29'),
(149, 'San Marino', 'Sammarinese', '2024-11-11 08:30:29', '2024-11-11 08:30:29'),
(150, 'Sao Tome and Principe', 'Sao Tomean', '2024-11-11 08:30:29', '2024-11-11 08:30:29'),
(151, 'Saudi Arabia', 'Saudi', '2024-11-11 08:30:29', '2024-11-11 08:30:29'),
(152, 'Senegal', 'Senegalese', '2024-11-11 08:30:29', '2024-11-11 08:30:29'),
(153, 'Serbia', 'Serbian', '2024-11-11 08:30:29', '2024-11-11 08:30:29'),
(154, 'Seychelles', 'Seychellois', '2024-11-11 08:30:29', '2024-11-11 08:30:29'),
(155, 'Sierra Leone', 'Sierra Leonean', '2024-11-11 08:30:29', '2024-11-11 08:30:29'),
(156, 'Singapore', 'Singaporean', '2024-11-11 08:30:29', '2024-11-11 08:30:29'),
(157, 'Slovakia', 'Slovak', '2024-11-11 08:30:29', '2024-11-11 08:30:29'),
(158, 'Slovenia', 'Slovenian', '2024-11-11 08:30:29', '2024-11-11 08:30:29'),
(159, 'Solomon Islands', 'Solomon Islander', '2024-11-11 08:30:29', '2024-11-11 08:30:29'),
(160, 'Somalia', 'Somali', '2024-11-11 08:30:29', '2024-11-11 08:30:29'),
(161, 'South Africa', 'South African', '2024-11-11 08:30:29', '2024-11-11 08:30:29'),
(162, 'South Sudan', 'South Sudanese', '2024-11-11 08:30:29', '2024-11-11 08:30:29'),
(163, 'Spain', 'Spanish', '2024-11-11 08:30:29', '2024-11-11 08:30:29'),
(164, 'Sri Lanka', 'Sri Lankan', '2024-11-11 08:30:29', '2024-11-11 08:30:29'),
(165, 'Sudan', 'Sudanese', '2024-11-11 08:30:29', '2024-11-11 08:30:29'),
(166, 'Suriname', 'Surinamese', '2024-11-11 08:30:29', '2024-11-11 08:30:29'),
(167, 'Sweden', 'Swedish', '2024-11-11 08:30:29', '2024-11-11 08:30:29'),
(168, 'Switzerland', 'Swiss', '2024-11-11 08:30:29', '2024-11-11 08:30:29'),
(169, 'Syria', 'Syrian', '2024-11-11 08:30:29', '2024-11-11 08:30:29'),
(170, 'Taiwan', 'Taiwanese', '2024-11-11 08:30:29', '2024-11-11 08:30:29'),
(171, 'Tajikistan', 'Tajik', '2024-11-11 08:30:29', '2024-11-11 08:30:29'),
(172, 'Tanzania', 'Tanzanian', '2024-11-11 08:30:29', '2024-11-11 08:30:29'),
(173, 'Thailand', 'Thai', '2024-11-11 08:30:29', '2024-11-11 08:30:29'),
(174, 'Togo', 'Togolese', '2024-11-11 08:30:29', '2024-11-11 08:30:29'),
(175, 'Tonga', 'Tongan', '2024-11-11 08:30:29', '2024-11-11 08:30:29'),
(176, 'Trinidad and Tobago', 'Trinidadian or Tobagonian', '2024-11-11 08:30:29', '2024-11-11 08:30:29'),
(177, 'Tunisia', 'Tunisian', '2024-11-11 08:30:29', '2024-11-11 08:30:29'),
(178, 'Turkey', 'Turkish', '2024-11-11 08:30:29', '2024-11-11 08:30:29'),
(179, 'Turkmenistan', 'Turkmen', '2024-11-11 08:30:29', '2024-11-11 08:30:29'),
(180, 'Tuvalu', 'Tuvaluan', '2024-11-11 08:30:29', '2024-11-11 08:30:29'),
(181, 'Uganda', 'Ugandan', '2024-11-11 08:30:29', '2024-11-11 08:30:29'),
(182, 'Ukraine', 'Ukrainian', '2024-11-11 08:30:29', '2024-11-11 08:30:29'),
(183, 'United Arab Emirates', 'Emirati', '2024-11-11 08:30:29', '2024-11-11 08:30:29'),
(184, 'United Kingdom', 'British', '2024-11-11 08:30:29', '2024-11-11 08:30:29'),
(185, 'United States', 'American', '2024-11-11 08:30:29', '2024-11-11 08:30:29'),
(186, 'Uruguay', 'Uruguayan', '2024-11-11 08:30:29', '2024-11-11 08:30:29'),
(187, 'Uzbekistan', 'Uzbek', '2024-11-11 08:30:29', '2024-11-11 08:30:29'),
(188, 'Vanuatu', 'Ni-Vanuatu', '2024-11-11 08:30:29', '2024-11-11 08:30:29'),
(189, 'Vatican City', 'Vatican', '2024-11-11 08:30:29', '2024-11-11 08:30:29'),
(190, 'Venezuela', 'Venezuelan', '2024-11-11 08:30:29', '2024-11-11 08:30:29'),
(191, 'Vietnam', 'Vietnamese', '2024-11-11 08:30:29', '2024-11-11 08:30:29'),
(192, 'Yemen', 'Yemeni', '2024-11-11 08:30:29', '2024-11-11 08:30:29'),
(193, 'Zambia', 'Zambian', '2024-11-11 08:30:29', '2024-11-11 08:30:29'),
(194, 'Zimbabwe', 'Zimbabwean', '2024-11-11 08:30:29', '2024-11-11 08:30:29');

-- --------------------------------------------------------

--
-- Table structure for table `contacts`
--

CREATE TABLE `contacts` (
  `id` bigint(20) NOT NULL,
  `personnel_id` bigint(20) NOT NULL,
  `contactype` varchar(20) NOT NULL,
  `contact_info` varchar(30) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `departments`
--

CREATE TABLE `departments` (
  `id` int(11) NOT NULL,
  `name` varchar(50) NOT NULL,
  `image_url` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `designations`
--

CREATE TABLE `designations` (
  `id` int(11) NOT NULL,
  `section_id` int(11) NOT NULL,
  `subsection_id` int(11) NOT NULL,
  `name` varchar(50) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `districts`
--

CREATE TABLE `districts` (
  `id` int(11) NOT NULL,
  `name` varchar(50) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `educational_background`
--

CREATE TABLE `educational_background` (
  `id` bigint(20) NOT NULL,
  `personnel_id` bigint(20) NOT NULL,
  `degree` varchar(30) NOT NULL,
  `field_of_study` varchar(50) DEFAULT NULL,
  `institution` varchar(50) NOT NULL,
  `completion_year` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `languages`
--

CREATE TABLE `languages` (
  `id` int(11) NOT NULL,
  `country_name` varchar(50) NOT NULL,
  `language` varchar(50) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `login_attempts`
--

CREATE TABLE `login_attempts` (
  `id` int(11) NOT NULL,
  `username` varchar(191) NOT NULL,
  `remote_ip` varchar(45) DEFAULT NULL,
  `user_agent` varchar(191) DEFAULT NULL,
  `successful` tinyint(1) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `login_attempts`
--

INSERT INTO `login_attempts` (`id`, `username`, `remote_ip`, `user_agent`, `successful`, `created_at`, `updated_at`) VALUES
(1, 'admin', '192.168.1.7', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36', 1, '2023-02-04 20:24:55', NULL),
(2, 'admin', '192.168.1.7', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36', 1, '2023-02-05 01:54:09', NULL),
(3, 'admin', '192.168.1.7', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36', 1, '2023-02-05 04:12:06', NULL),
(4, 'admin', '172.18.124.93', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36', 1, '2023-02-05 17:55:48', NULL),
(5, 'admin', '172.18.124.93', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36', 1, '2023-02-06 20:35:43', NULL),
(6, 'admin', '172.18.124.93', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36', 1, '2023-02-06 21:04:46', NULL),
(7, 'admin', '172.18.124.93', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36', 1, '2023-02-07 17:04:55', NULL),
(8, 'admin', '172.18.124.93', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36', 1, '2023-02-08 19:34:42', NULL),
(9, 'admin', '172.18.124.93', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36', 1, '2023-02-08 19:38:28', NULL),
(10, 'admin', '172.18.124.93', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36', 1, '2023-02-09 19:36:25', NULL),
(11, 'admin', '172.18.124.93', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36', 1, '2023-02-09 23:38:53', NULL),
(12, 'admin', '172.18.124.93', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36', 1, '2023-02-12 21:39:28', NULL),
(13, 'admin', '172.18.124.93', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36', 1, '2023-03-02 17:02:50', NULL),
(14, 'admin', '172.18.124.93', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36', 1, '2023-03-05 23:32:16', NULL),
(15, 'admin', '172.18.124.93', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36', 1, '2023-03-06 18:30:00', NULL),
(16, 'admin', '172.18.124.93', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36', 1, '2023-03-06 23:13:12', NULL),
(17, 'admin', '172.18.124.93', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36', 1, '2023-03-06 23:18:21', NULL),
(18, 'admin', '172.20.10.9', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36', 1, '2023-03-07 07:24:59', NULL),
(19, 'admin', '172.18.124.93', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36', 1, '2023-03-07 18:38:24', NULL),
(20, 'admin', '172.18.124.93', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36', 1, '2023-03-07 20:39:53', NULL),
(21, 'admin', '172.18.124.93', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36', 1, '2023-03-07 21:37:26', NULL),
(22, 'admin', '172.18.124.93', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36', 1, '2023-03-07 21:46:48', NULL),
(23, 'admin', '172.18.124.121', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36', 1, '2023-03-13 16:46:14', NULL),
(24, 'admin', '172.18.124.121', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36', 1, '2023-03-14 20:31:28', NULL),
(25, 'fmpareja', '172.18.124.121', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36', 1, '2023-03-21 16:35:57', NULL),
(26, 'admin', '172.18.124.121', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36', 1, '2023-03-21 16:36:11', NULL),
(27, 'admin', '172.18.124.121', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36', 1, '2023-03-23 16:35:11', NULL),
(28, 'fmpareja', '172.18.124.121', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36', 1, '2023-03-23 19:34:54', NULL),
(29, 'fmpareja', '172.18.124.121', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36', 1, '2023-03-23 19:35:09', NULL),
(30, 'admin', '172.18.124.121', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36', 1, '2023-03-23 19:35:15', NULL),
(31, 'admin', '172.18.124.121', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36', 1, '2023-03-23 21:12:25', NULL),
(32, 'kamaro', '172.18.124.121', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36', 1, '2023-03-23 21:17:32', NULL),
(33, 'admin', '172.18.124.121', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36', 1, '2023-03-23 22:30:27', NULL),
(34, 'kamaro', '172.20.10.9', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36', 1, '2023-03-24 07:39:38', NULL),
(35, 'admin', '172.20.10.9', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36', 1, '2023-03-24 07:40:22', NULL),
(36, 'admin', '169.254.189.25', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36', 1, '2023-03-25 07:20:14', NULL),
(37, 'admin', '169.254.189.25', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36', 1, '2023-04-02 06:54:34', NULL),
(38, 'admin', '172.18.124.121', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36', 1, '2023-04-02 22:31:28', NULL),
(39, 'admin', '172.18.124.121', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36', 1, '2023-04-02 22:37:53', NULL),
(40, 'admin', '172.18.124.121', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36 Edg/111.0.1661.54', 1, '2023-04-03 18:33:24', NULL),
(41, 'fmpareja', '172.18.124.121', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36 Edg/111.0.1661.54', 1, '2023-04-03 20:31:23', NULL),
(42, 'admin', '172.18.124.121', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36 Edg/111.0.1661.54', 1, '2023-04-03 20:31:32', NULL),
(43, 'admin', '172.18.124.121', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36 Edg/111.0.1661.54', 1, '2023-04-04 15:50:21', NULL),
(44, 'fmpareja', '172.18.124.121', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36 Edg/111.0.1661.54', 1, '2023-04-05 00:01:37', NULL),
(45, 'admin', '172.18.124.121', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36 Edg/111.0.1661.54', 1, '2023-04-05 00:01:49', NULL),
(46, 'fmpareja', '172.18.124.121', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36', 1, '2023-04-05 00:27:44', NULL),
(47, 'fmpareja', '172.18.124.121', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36', 1, '2023-04-06 15:52:51', NULL),
(48, 'admin', '172.18.124.121', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36', 1, '2023-04-06 15:53:05', NULL),
(49, 'fmpareja', '172.18.124.121', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36', 1, '2023-04-06 15:54:44', NULL),
(50, 'admin', '172.18.124.121', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36', 1, '2023-04-06 16:20:50', NULL),
(51, 'fmpareja', '172.18.124.121', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36', 1, '2023-04-06 16:22:54', NULL),
(52, 'admin', '169.254.189.25', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36', 1, '2023-04-07 19:19:40', NULL),
(53, 'test', '169.254.189.25', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36', 1, '2023-04-07 23:00:37', NULL),
(54, 'admin', '169.254.189.25', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36', 1, '2023-04-07 23:00:49', NULL),
(55, 'test', '169.254.189.25', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36 Edg/111.0.1661.62', 1, '2023-04-07 23:32:39', NULL),
(56, 'fmpareja', '169.254.189.25', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36', 1, '2023-04-09 08:28:31', NULL),
(57, 'kamaro123', '169.254.189.25', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36', 1, '2023-04-09 08:31:58', NULL),
(58, 'admin', '169.254.189.25', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36', 1, '2023-04-09 08:36:10', NULL),
(59, 'fmpareja', '169.254.189.25', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36', 1, '2023-04-09 09:00:03', NULL),
(60, 'admin', '169.254.189.25', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36', 1, '2023-04-09 09:00:14', NULL),
(61, 'fmpareja', '169.254.189.25', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36', 1, '2023-04-09 09:01:37', NULL),
(62, 'test', '169.254.189.25', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36', 1, '2023-04-09 09:39:11', NULL),
(63, 'fmpareja', '169.254.189.25', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36', 1, '2023-04-09 09:39:38', NULL),
(64, 'test', '169.254.189.25', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36', 1, '2023-04-09 09:40:21', NULL),
(65, 'fmpareja', '169.254.189.25', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36', 1, '2023-04-09 09:41:25', NULL),
(66, 'admin', '169.254.189.25', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36', 1, '2023-04-09 09:41:39', NULL),
(67, 'admin', '172.18.124.121', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36', 1, '2023-04-11 18:15:12', NULL),
(68, 'fmpareja', '172.18.124.121', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36', 1, '2023-04-11 18:15:31', NULL),
(69, 'fmpareja', '172.18.124.121', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36', 1, '2023-04-11 21:26:32', NULL),
(70, 'atg', '172.18.124.121', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36 Edg/112.0.1722.34', 1, '2023-04-11 21:27:20', NULL),
(71, 'fmpareja', '172.18.124.121', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36', 1, '2023-04-12 18:26:04', NULL),
(72, 'admin', '172.18.124.121', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36', 1, '2023-04-12 19:40:41', NULL),
(73, 'admin', '172.18.124.121', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36', 1, '2023-04-12 19:43:28', NULL),
(74, 'admin', '172.18.124.121', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36', 1, '2023-04-12 19:44:14', NULL),
(75, 'admin', '172.18.124.121', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36', 1, '2023-04-12 19:44:40', NULL),
(76, 'admin', '172.18.124.121', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36', 1, '2023-04-12 19:44:48', NULL),
(77, 'admin', '172.18.124.121', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36', 1, '2023-04-12 19:45:33', NULL),
(78, 'admin', '172.18.124.121', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36', 1, '2023-04-12 19:46:20', NULL),
(79, 'admin', '172.18.124.121', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36', 1, '2023-04-12 19:47:40', NULL),
(80, 'admin', '172.18.124.121', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36', 1, '2023-04-12 19:48:30', NULL),
(81, 'admin', '172.18.124.121', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36', 1, '2023-04-12 19:48:47', NULL),
(82, 'admin', '172.18.124.121', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36', 1, '2023-04-12 19:58:19', NULL),
(83, 'admin', '172.18.124.121', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36', 1, '2023-04-12 19:58:42', NULL),
(84, 'admin', '172.18.124.121', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36', 1, '2023-04-12 19:59:21', NULL),
(85, 'admin', '172.18.124.121', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36', 1, '2023-04-12 20:00:15', NULL),
(86, 'admin', '172.18.124.121', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36', 1, '2023-04-12 20:01:00', NULL),
(87, 'fmpareja', '172.18.124.121', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36 Edg/112.0.1722.39', 1, '2023-04-12 20:01:47', NULL),
(88, 'admin', '172.18.124.121', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36', 1, '2023-04-12 20:03:59', NULL),
(89, 'admin', '172.18.124.121', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36', 1, '2023-04-12 20:04:25', NULL),
(90, 'admin', '172.18.124.121', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36', 1, '2023-04-12 20:05:17', NULL),
(91, 'admin', '172.18.124.121', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36', 1, '2023-04-12 20:06:14', NULL),
(92, 'admin', '172.18.124.121', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36', 1, '2023-04-12 20:06:41', NULL),
(93, 'admin', '172.18.124.121', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36', 1, '2023-04-12 20:07:21', NULL),
(94, 'admin', '172.18.124.121', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36', 1, '2023-04-12 20:08:20', NULL),
(95, 'admin', '172.18.124.121', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36', 1, '2023-04-12 20:10:12', NULL),
(96, 'admin', '172.18.124.121', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36', 1, '2023-04-12 20:10:29', NULL),
(97, 'admin', '172.18.124.121', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36', 1, '2023-04-12 20:13:58', NULL),
(98, 'admin', '172.18.124.121', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36', 1, '2023-04-12 20:14:24', NULL),
(99, 'admin', '172.18.124.121', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36', 1, '2023-04-12 20:15:12', NULL),
(100, 'admin', '172.18.124.121', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36', 1, '2023-04-12 20:36:35', NULL),
(101, 'admin', '172.18.124.121', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36', 1, '2023-04-12 20:52:11', NULL),
(102, 'admin', '172.18.124.121', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36', 1, '2023-04-12 21:25:39', NULL),
(103, 'admin', '172.18.124.121', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36', 1, '2023-04-12 21:39:56', NULL),
(104, 'admin', '172.18.124.121', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36', 1, '2023-04-12 21:42:15', NULL),
(105, 'admin', '172.18.124.121', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36', 1, '2023-04-12 21:44:13', NULL),
(106, 'fmpareja', '172.18.124.121', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36 Edg/112.0.1722.39', 1, '2023-04-12 21:44:55', NULL),
(107, 'fmpareja', '172.18.124.121', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36 Edg/112.0.1722.39', 1, '2023-04-12 21:49:18', NULL),
(108, 'admin', '192.168.56.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36', 1, '2023-04-13 17:17:09', NULL),
(109, 'admin', '192.168.56.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36', 1, '2023-04-13 17:17:23', NULL),
(110, 'fmpareja', '192.168.56.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36', 1, '2023-04-13 17:17:44', NULL),
(111, 'fmpareja', '192.168.56.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36', 1, '2023-04-13 23:17:02', NULL),
(112, 'admin', '192.168.56.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36', 1, '2023-04-13 23:20:36', NULL),
(113, 'fmpareja', '192.168.56.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36', 1, '2023-04-13 23:20:47', NULL),
(114, 'fmpareja', '192.168.56.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36', 1, '2023-04-15 19:42:58', NULL),
(115, 'fmpareja', '192.168.56.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36', 1, '2023-04-17 18:58:45', NULL),
(116, 'fmpareja', '192.168.56.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36', 1, '2023-06-01 17:45:58', NULL),
(117, 'fmpareja', '192.168.56.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36', 1, '2023-06-08 16:16:58', NULL),
(118, 'fmpareja', '192.168.56.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36', 1, '2023-07-03 14:30:13', NULL),
(119, 'fmpareja', '192.168.56.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36', 1, '2023-07-03 18:46:11', NULL),
(120, 'fmpareja', '192.168.56.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36', 1, '2023-07-03 19:57:23', NULL),
(121, 'fmpareja', '192.168.56.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36', 1, '2023-07-03 19:57:48', NULL),
(122, 'fmpareja', '192.168.56.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36', 1, '2023-07-03 23:24:07', NULL),
(123, 'fmpareja', '192.168.56.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36', 1, '2023-07-09 20:20:21', NULL),
(124, 'atg', '192.168.56.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36', 1, '2023-07-09 20:21:40', NULL),
(125, 'fmpareja', '192.168.56.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36', 1, '2023-07-09 20:49:25', NULL),
(126, 'fmpareja', '192.168.56.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36', 1, '2023-07-09 21:35:57', NULL),
(127, 'fmpareja', '192.168.56.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36', 1, '2023-07-09 22:50:23', NULL),
(128, 'fmpareja', '192.168.56.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36', 1, '2023-07-12 20:55:22', NULL),
(129, 'fmpareja', '192.168.56.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36', 1, '2023-07-12 21:19:58', NULL),
(130, 'fmpareja', '192.168.56.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36', 1, '2023-07-12 21:47:41', NULL),
(131, 'fmpareja', '192.168.56.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36', 1, '2023-07-12 21:49:31', NULL),
(132, 'fmpareja', '192.168.56.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36', 1, '2023-07-12 21:51:44', NULL),
(133, 'fmpareja', '192.168.56.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36', 1, '2023-07-12 22:12:50', NULL),
(134, 'fmpareja', '192.168.56.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36', 1, '2023-07-12 22:28:09', NULL),
(135, 'fmpareja', '192.168.56.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36', 1, '2023-07-12 22:33:59', NULL),
(136, 'fmpareja', '192.168.56.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36', 1, '2023-07-12 22:36:42', NULL),
(137, 'fmpareja', '192.168.56.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36', 1, '2023-07-12 22:37:05', NULL),
(138, 'fmpareja', '192.168.56.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36', 1, '2023-07-12 23:15:20', NULL),
(139, 'admin', '192.168.56.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36 Edg/114.0.1823.79', 1, '2023-07-13 17:58:08', NULL),
(140, 'kyrtjurada', '192.168.56.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36 Edg/114.0.1823.79', 1, '2023-07-13 18:30:05', NULL),
(141, 'admin', '192.168.56.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36 Edg/114.0.1823.79', 1, '2023-07-13 18:35:54', NULL),
(142, 'admin', '192.168.56.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36 Edg/114.0.1823.79', 1, '2023-07-13 18:50:29', NULL),
(143, 'admin', '192.168.56.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36 Edg/114.0.1823.79', 1, '2023-07-13 18:52:33', NULL),
(144, 'admin', '192.168.56.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36 Edg/114.0.1823.79', 1, '2023-07-13 19:06:08', NULL),
(145, 'admin', '192.168.56.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36 Edg/114.0.1823.79', 1, '2023-07-13 19:08:38', NULL),
(146, 'admin', '192.168.56.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36 Edg/114.0.1823.79', 1, '2023-07-13 19:46:16', NULL),
(147, 'admin', '192.168.56.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36 Edg/114.0.1823.79', 1, '2023-07-16 18:52:24', NULL),
(148, 'fmpareja', '192.168.56.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36 Edg/114.0.1823.79', 1, '2023-07-16 18:52:42', NULL),
(149, 'fmpareja', '192.168.56.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36 Edg/114.0.1823.79', 1, '2023-07-17 17:56:43', NULL),
(150, 'fmpareja', '192.168.56.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36 Edg/114.0.1823.79', 1, '2023-07-17 22:02:15', NULL),
(151, 'fmpareja', '192.168.56.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36', 1, '2023-07-27 21:37:54', NULL),
(152, 'admin', '192.168.56.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36 Edg/115.0.1901.188', 1, '2023-08-08 23:10:28', NULL),
(153, 'fmpareja', '192.168.56.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36 Edg/115.0.1901.200', 1, '2023-08-10 17:33:27', NULL),
(154, 'admin', '192.168.56.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36', 1, '2023-09-05 23:27:41', NULL),
(155, 'admin', '192.168.56.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36', 1, '2023-09-07 19:25:25', NULL),
(156, 'admin', '192.168.56.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36', 1, '2023-09-11 17:07:08', NULL),
(157, 'admin', '192.168.56.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36 Edg/116.0.1938.69', 1, '2023-09-11 17:18:59', NULL),
(158, 'admin', '192.168.56.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36', 1, '2023-09-12 19:58:39', NULL),
(159, 'admin', '192.168.56.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36 Edg/116.0.1938.76', 1, '2023-09-12 20:22:45', NULL),
(160, 'admin', '192.168.56.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36', 1, '2023-12-22 00:26:33', NULL),
(161, 'admin', '192.168.56.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36', 1, '2023-12-26 15:28:46', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `nationalities`
--

CREATE TABLE `nationalities` (
  `id` int(11) NOT NULL,
  `country_name` varchar(100) NOT NULL,
  `nationality` varchar(100) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `nationalities`
--

INSERT INTO `nationalities` (`id`, `country_name`, `nationality`, `created_at`, `updated_at`) VALUES
(1, 'Afghanistan', 'Afghan', '2024-11-11 08:30:57', '2024-11-11 08:30:57'),
(2, 'Albania', 'Albanian', '2024-11-11 08:30:57', '2024-11-11 08:30:57'),
(3, 'Algeria', 'Algerian', '2024-11-11 08:30:57', '2024-11-11 08:30:57'),
(4, 'Andorra', 'Andorran', '2024-11-11 08:30:57', '2024-11-11 08:30:57'),
(5, 'Angola', 'Angolan', '2024-11-11 08:30:57', '2024-11-11 08:30:57'),
(6, 'Antigua and Barbuda', 'Antiguan or Barbudan', '2024-11-11 08:30:57', '2024-11-11 08:30:57'),
(7, 'Argentina', 'Argentine', '2024-11-11 08:30:57', '2024-11-11 08:30:57'),
(8, 'Armenia', 'Armenian', '2024-11-11 08:30:57', '2024-11-11 08:30:57'),
(9, 'Australia', 'Australian', '2024-11-11 08:30:57', '2024-11-11 08:30:57'),
(10, 'Austria', 'Austrian', '2024-11-11 08:30:57', '2024-11-11 08:30:57'),
(11, 'Azerbaijan', 'Azerbaijani', '2024-11-11 08:30:57', '2024-11-11 08:30:57'),
(12, 'Bahamas', 'Bahamian', '2024-11-11 08:30:57', '2024-11-11 08:30:57'),
(13, 'Bahrain', 'Bahraini', '2024-11-11 08:30:57', '2024-11-11 08:30:57'),
(14, 'Bangladesh', 'Bangladeshi', '2024-11-11 08:30:57', '2024-11-11 08:30:57'),
(15, 'Barbados', 'Barbadian', '2024-11-11 08:30:57', '2024-11-11 08:30:57'),
(16, 'Belarus', 'Belarusian', '2024-11-11 08:30:57', '2024-11-11 08:30:57'),
(17, 'Belgium', 'Belgian', '2024-11-11 08:30:57', '2024-11-11 08:30:57'),
(18, 'Belize', 'Belizean', '2024-11-11 08:30:57', '2024-11-11 08:30:57'),
(19, 'Benin', 'Beninese', '2024-11-11 08:30:57', '2024-11-11 08:30:57'),
(20, 'Bhutan', 'Bhutanese', '2024-11-11 08:30:57', '2024-11-11 08:30:57'),
(21, 'Bolivia', 'Bolivian', '2024-11-11 08:30:57', '2024-11-11 08:30:57'),
(22, 'Bosnia and Herzegovina', 'Bosnian', '2024-11-11 08:30:57', '2024-11-11 08:30:57'),
(23, 'Botswana', 'Botswana', '2024-11-11 08:30:57', '2024-11-11 08:30:57'),
(24, 'Brazil', 'Brazilian', '2024-11-11 08:30:57', '2024-11-11 08:30:57'),
(25, 'Brunei', 'Bruneian', '2024-11-11 08:30:57', '2024-11-11 08:30:57'),
(26, 'Bulgaria', 'Bulgarian', '2024-11-11 08:30:57', '2024-11-11 08:30:57'),
(27, 'Burkina Faso', 'Burkinabe', '2024-11-11 08:30:57', '2024-11-11 08:30:57'),
(28, 'Burundi', 'Burundian', '2024-11-11 08:30:57', '2024-11-11 08:30:57'),
(29, 'Cabo Verde', 'Cape Verdean', '2024-11-11 08:30:57', '2024-11-11 08:30:57'),
(30, 'Cambodia', 'Cambodian', '2024-11-11 08:30:57', '2024-11-11 08:30:57'),
(31, 'Cameroon', 'Cameroonian', '2024-11-11 08:30:57', '2024-11-11 08:30:57'),
(32, 'Canada', 'Canadian', '2024-11-11 08:30:57', '2024-11-11 08:30:57'),
(33, 'Central African Republic', 'Central African', '2024-11-11 08:30:57', '2024-11-11 08:30:57'),
(34, 'Chad', 'Chadian', '2024-11-11 08:30:57', '2024-11-11 08:30:57'),
(35, 'Chile', 'Chilean', '2024-11-11 08:30:57', '2024-11-11 08:30:57'),
(36, 'China', 'Chinese', '2024-11-11 08:30:57', '2024-11-11 08:30:57'),
(37, 'Colombia', 'Colombian', '2024-11-11 08:30:57', '2024-11-11 08:30:57'),
(38, 'Comoros', 'Comoran', '2024-11-11 08:30:57', '2024-11-11 08:30:57'),
(39, 'Congo, Democratic Republic of the', 'Congolese', '2024-11-11 08:30:57', '2024-11-11 08:30:57'),
(40, 'Congo, Republic of the', 'Congolese', '2024-11-11 08:30:57', '2024-11-11 08:30:57'),
(41, 'Costa Rica', 'Costa Rican', '2024-11-11 08:30:57', '2024-11-11 08:30:57'),
(42, 'Croatia', 'Croatian', '2024-11-11 08:30:57', '2024-11-11 08:30:57'),
(43, 'Cuba', 'Cuban', '2024-11-11 08:30:57', '2024-11-11 08:30:57'),
(44, 'Cyprus', 'Cypriot', '2024-11-11 08:30:57', '2024-11-11 08:30:57'),
(45, 'Czech Republic', 'Czech', '2024-11-11 08:30:57', '2024-11-11 08:30:57'),
(46, 'Denmark', 'Danish', '2024-11-11 08:30:57', '2024-11-11 08:30:57'),
(47, 'Djibouti', 'Djiboutian', '2024-11-11 08:30:57', '2024-11-11 08:30:57'),
(48, 'Dominica', 'Dominican', '2024-11-11 08:30:57', '2024-11-11 08:30:57'),
(49, 'Dominican Republic', 'Dominican', '2024-11-11 08:30:57', '2024-11-11 08:30:57'),
(50, 'Ecuador', 'Ecuadorian', '2024-11-11 08:30:57', '2024-11-11 08:30:57'),
(51, 'Egypt', 'Egyptian', '2024-11-11 08:30:57', '2024-11-11 08:30:57'),
(52, 'El Salvador', 'Salvadoran', '2024-11-11 08:30:57', '2024-11-11 08:30:57'),
(53, 'Equatorial Guinea', 'Equatoguinean', '2024-11-11 08:30:57', '2024-11-11 08:30:57'),
(54, 'Eritrea', 'Eritrean', '2024-11-11 08:30:57', '2024-11-11 08:30:57'),
(55, 'Estonia', 'Estonian', '2024-11-11 08:30:57', '2024-11-11 08:30:57'),
(56, 'Eswatini', 'Swazi', '2024-11-11 08:30:57', '2024-11-11 08:30:57'),
(57, 'Ethiopia', 'Ethiopian', '2024-11-11 08:30:57', '2024-11-11 08:30:57'),
(58, 'Fiji', 'Fijian', '2024-11-11 08:30:57', '2024-11-11 08:30:57'),
(59, 'Finland', 'Finnish', '2024-11-11 08:30:57', '2024-11-11 08:30:57'),
(60, 'France', 'French', '2024-11-11 08:30:57', '2024-11-11 08:30:57'),
(61, 'Gabon', 'Gabonese', '2024-11-11 08:30:57', '2024-11-11 08:30:57'),
(62, 'Gambia', 'Gambian', '2024-11-11 08:30:57', '2024-11-11 08:30:57'),
(63, 'Georgia', 'Georgian', '2024-11-11 08:30:57', '2024-11-11 08:30:57'),
(64, 'Germany', 'German', '2024-11-11 08:30:57', '2024-11-11 08:30:57'),
(65, 'Ghana', 'Ghanaian', '2024-11-11 08:30:57', '2024-11-11 08:30:57'),
(66, 'Greece', 'Greek', '2024-11-11 08:30:57', '2024-11-11 08:30:57'),
(67, 'Grenada', 'Grenadian', '2024-11-11 08:30:57', '2024-11-11 08:30:57'),
(68, 'Guatemala', 'Guatemalan', '2024-11-11 08:30:57', '2024-11-11 08:30:57'),
(69, 'Guinea', 'Guinean', '2024-11-11 08:30:57', '2024-11-11 08:30:57'),
(70, 'Guinea-Bissau', 'Guinea-Bissauan', '2024-11-11 08:30:57', '2024-11-11 08:30:57'),
(71, 'Guyana', 'Guyanese', '2024-11-11 08:30:57', '2024-11-11 08:30:57'),
(72, 'Haiti', 'Haitian', '2024-11-11 08:30:57', '2024-11-11 08:30:57'),
(73, 'Honduras', 'Honduran', '2024-11-11 08:30:57', '2024-11-11 08:30:57'),
(74, 'Hungary', 'Hungarian', '2024-11-11 08:30:57', '2024-11-11 08:30:57'),
(75, 'Iceland', 'Icelander', '2024-11-11 08:30:57', '2024-11-11 08:30:57'),
(76, 'India', 'Indian', '2024-11-11 08:30:57', '2024-11-11 08:30:57'),
(77, 'Indonesia', 'Indonesian', '2024-11-11 08:30:57', '2024-11-11 08:30:57'),
(78, 'Iran', 'Iranian', '2024-11-11 08:30:57', '2024-11-11 08:30:57'),
(79, 'Iraq', 'Iraqi', '2024-11-11 08:30:57', '2024-11-11 08:30:57'),
(80, 'Ireland', 'Irish', '2024-11-11 08:30:57', '2024-11-11 08:30:57'),
(81, 'Israel', 'Israeli', '2024-11-11 08:30:57', '2024-11-11 08:30:57'),
(82, 'Italy', 'Italian', '2024-11-11 08:30:57', '2024-11-11 08:30:57'),
(83, 'Jamaica', 'Jamaican', '2024-11-11 08:30:57', '2024-11-11 08:30:57'),
(84, 'Japan', 'Japanese', '2024-11-11 08:30:57', '2024-11-11 08:30:57'),
(85, 'Jordan', 'Jordanian', '2024-11-11 08:30:57', '2024-11-11 08:30:57'),
(86, 'Kazakhstan', 'Kazakhstani', '2024-11-11 08:30:57', '2024-11-11 08:30:57'),
(87, 'Kenya', 'Kenyan', '2024-11-11 08:30:57', '2024-11-11 08:30:57'),
(88, 'Kiribati', 'I-Kiribati', '2024-11-11 08:30:57', '2024-11-11 08:30:57'),
(89, 'Korea, North', 'North Korean', '2024-11-11 08:30:57', '2024-11-11 08:30:57'),
(90, 'Korea, South', 'South Korean', '2024-11-11 08:30:57', '2024-11-11 08:30:57'),
(91, 'Kuwait', 'Kuwaiti', '2024-11-11 08:30:57', '2024-11-11 08:30:57'),
(92, 'Kyrgyzstan', 'Kyrgyzstani', '2024-11-11 08:30:57', '2024-11-11 08:30:57'),
(93, 'Laos', 'Laotian', '2024-11-11 08:30:57', '2024-11-11 08:30:57'),
(94, 'Latvia', 'Latvian', '2024-11-11 08:30:57', '2024-11-11 08:30:57'),
(95, 'Lebanon', 'Lebanese', '2024-11-11 08:30:57', '2024-11-11 08:30:57'),
(96, 'Lesotho', 'Mosotho', '2024-11-11 08:30:57', '2024-11-11 08:30:57'),
(97, 'Liberia', 'Liberian', '2024-11-11 08:30:57', '2024-11-11 08:30:57'),
(98, 'Libya', 'Libyan', '2024-11-11 08:30:57', '2024-11-11 08:30:57'),
(99, 'Liechtenstein', 'Liechtensteiner', '2024-11-11 08:30:57', '2024-11-11 08:30:57'),
(100, 'Lithuania', 'Lithuanian', '2024-11-11 08:30:57', '2024-11-11 08:30:57'),
(101, 'Luxembourg', 'Luxembourger', '2024-11-11 08:30:57', '2024-11-11 08:30:57'),
(102, 'Madagascar', 'Malagasy', '2024-11-11 08:30:57', '2024-11-11 08:30:57'),
(103, 'Malawi', 'Malawian', '2024-11-11 08:30:57', '2024-11-11 08:30:57'),
(104, 'Malaysia', 'Malaysian', '2024-11-11 08:30:57', '2024-11-11 08:30:57'),
(105, 'Maldives', 'Maldivian', '2024-11-11 08:30:57', '2024-11-11 08:30:57'),
(106, 'Mali', 'Malian', '2024-11-11 08:30:57', '2024-11-11 08:30:57'),
(107, 'Malta', 'Maltese', '2024-11-11 08:30:57', '2024-11-11 08:30:57'),
(108, 'Marshall Islands', 'Marshallese', '2024-11-11 08:30:57', '2024-11-11 08:30:57'),
(109, 'Mauritania', 'Mauritanian', '2024-11-11 08:30:57', '2024-11-11 08:30:57'),
(110, 'Mauritius', 'Mauritian', '2024-11-11 08:30:57', '2024-11-11 08:30:57'),
(111, 'Mexico', 'Mexican', '2024-11-11 08:30:57', '2024-11-11 08:30:57'),
(112, 'Micronesia', 'Micronesian', '2024-11-11 08:30:57', '2024-11-11 08:30:57'),
(113, 'Moldova', 'Moldovan', '2024-11-11 08:30:57', '2024-11-11 08:30:57'),
(114, 'Monaco', 'Monacan', '2024-11-11 08:30:57', '2024-11-11 08:30:57'),
(115, 'Mongolia', 'Mongolian', '2024-11-11 08:30:57', '2024-11-11 08:30:57'),
(116, 'Montenegro', 'Montenegrin', '2024-11-11 08:30:57', '2024-11-11 08:30:57'),
(117, 'Morocco', 'Moroccan', '2024-11-11 08:30:57', '2024-11-11 08:30:57'),
(118, 'Mozambique', 'Mozambican', '2024-11-11 08:30:57', '2024-11-11 08:30:57'),
(119, 'Myanmar', 'Burmese', '2024-11-11 08:30:57', '2024-11-11 08:30:57'),
(120, 'Namibia', 'Namibian', '2024-11-11 08:30:57', '2024-11-11 08:30:57'),
(121, 'Nauru', 'Nauruan', '2024-11-11 08:30:57', '2024-11-11 08:30:57'),
(122, 'Nepal', 'Nepalese', '2024-11-11 08:30:57', '2024-11-11 08:30:57'),
(123, 'Netherlands', 'Dutch', '2024-11-11 08:30:57', '2024-11-11 08:30:57'),
(124, 'New Zealand', 'New Zealander', '2024-11-11 08:30:57', '2024-11-11 08:30:57'),
(125, 'Nicaragua', 'Nicaraguan', '2024-11-11 08:30:57', '2024-11-11 08:30:57'),
(126, 'Niger', 'Nigerien', '2024-11-11 08:30:57', '2024-11-11 08:30:57'),
(127, 'Nigeria', 'Nigerian', '2024-11-11 08:30:57', '2024-11-11 08:30:57'),
(128, 'North Macedonia', 'Macedonian', '2024-11-11 08:30:57', '2024-11-11 08:30:57'),
(129, 'Norway', 'Norwegian', '2024-11-11 08:30:57', '2024-11-11 08:30:57'),
(130, 'Oman', 'Omani', '2024-11-11 08:30:57', '2024-11-11 08:30:57'),
(131, 'Pakistan', 'Pakistani', '2024-11-11 08:30:57', '2024-11-11 08:30:57'),
(132, 'Palau', 'Palauan', '2024-11-11 08:30:57', '2024-11-11 08:30:57'),
(133, 'Palestine', 'Palestinian', '2024-11-11 08:30:57', '2024-11-11 08:30:57'),
(134, 'Panama', 'Panamanian', '2024-11-11 08:30:57', '2024-11-11 08:30:57'),
(135, 'Papua New Guinea', 'Papua New Guinean', '2024-11-11 08:30:57', '2024-11-11 08:30:57'),
(136, 'Paraguay', 'Paraguayan', '2024-11-11 08:30:57', '2024-11-11 08:30:57'),
(137, 'Peru', 'Peruvian', '2024-11-11 08:30:57', '2024-11-11 08:30:57'),
(138, 'Philippines', 'Filipino', '2024-11-11 08:30:57', '2024-11-11 08:30:57'),
(139, 'Poland', 'Polish', '2024-11-11 08:30:57', '2024-11-11 08:30:57'),
(140, 'Portugal', 'Portuguese', '2024-11-11 08:30:57', '2024-11-11 08:30:57'),
(141, 'Qatar', 'Qatari', '2024-11-11 08:30:57', '2024-11-11 08:30:57'),
(142, 'Romania', 'Romanian', '2024-11-11 08:30:57', '2024-11-11 08:30:57'),
(143, 'Russia', 'Russian', '2024-11-11 08:30:57', '2024-11-11 08:30:57'),
(144, 'Rwanda', 'Rwandan', '2024-11-11 08:30:57', '2024-11-11 08:30:57'),
(145, 'Saint Kitts and Nevis', 'Kittitian or Nevisian', '2024-11-11 08:30:57', '2024-11-11 08:30:57'),
(146, 'Saint Lucia', 'Saint Lucian', '2024-11-11 08:30:57', '2024-11-11 08:30:57'),
(147, 'Saint Vincent and the Grenadines', 'Saint Vincentian', '2024-11-11 08:30:57', '2024-11-11 08:30:57'),
(148, 'Samoa', 'Samoan', '2024-11-11 08:30:57', '2024-11-11 08:30:57'),
(149, 'San Marino', 'Sammarinese', '2024-11-11 08:30:57', '2024-11-11 08:30:57'),
(150, 'Sao Tome and Principe', 'Sao Tomean', '2024-11-11 08:30:57', '2024-11-11 08:30:57'),
(151, 'Saudi Arabia', 'Saudi', '2024-11-11 08:30:57', '2024-11-11 08:30:57'),
(152, 'Senegal', 'Senegalese', '2024-11-11 08:30:57', '2024-11-11 08:30:57'),
(153, 'Serbia', 'Serbian', '2024-11-11 08:30:57', '2024-11-11 08:30:57'),
(154, 'Seychelles', 'Seychellois', '2024-11-11 08:30:57', '2024-11-11 08:30:57'),
(155, 'Sierra Leone', 'Sierra Leonean', '2024-11-11 08:30:57', '2024-11-11 08:30:57'),
(156, 'Singapore', 'Singaporean', '2024-11-11 08:30:57', '2024-11-11 08:30:57'),
(157, 'Slovakia', 'Slovak', '2024-11-11 08:30:57', '2024-11-11 08:30:57'),
(158, 'Slovenia', 'Slovenian', '2024-11-11 08:30:57', '2024-11-11 08:30:57'),
(159, 'Solomon Islands', 'Solomon Islander', '2024-11-11 08:30:57', '2024-11-11 08:30:57'),
(160, 'Somalia', 'Somali', '2024-11-11 08:30:57', '2024-11-11 08:30:57'),
(161, 'South Africa', 'South African', '2024-11-11 08:30:57', '2024-11-11 08:30:57'),
(162, 'South Sudan', 'South Sudanese', '2024-11-11 08:30:57', '2024-11-11 08:30:57'),
(163, 'Spain', 'Spanish', '2024-11-11 08:30:57', '2024-11-11 08:30:57'),
(164, 'Sri Lanka', 'Sri Lankan', '2024-11-11 08:30:57', '2024-11-11 08:30:57'),
(165, 'Sudan', 'Sudanese', '2024-11-11 08:30:57', '2024-11-11 08:30:57'),
(166, 'Suriname', 'Surinamese', '2024-11-11 08:30:57', '2024-11-11 08:30:57'),
(167, 'Sweden', 'Swedish', '2024-11-11 08:30:57', '2024-11-11 08:30:57'),
(168, 'Switzerland', 'Swiss', '2024-11-11 08:30:57', '2024-11-11 08:30:57'),
(169, 'Syria', 'Syrian', '2024-11-11 08:30:57', '2024-11-11 08:30:57'),
(170, 'Taiwan', 'Taiwanese', '2024-11-11 08:30:57', '2024-11-11 08:30:57'),
(171, 'Tajikistan', 'Tajik', '2024-11-11 08:30:57', '2024-11-11 08:30:57'),
(172, 'Tanzania', 'Tanzanian', '2024-11-11 08:30:57', '2024-11-11 08:30:57'),
(173, 'Thailand', 'Thai', '2024-11-11 08:30:57', '2024-11-11 08:30:57'),
(174, 'Togo', 'Togolese', '2024-11-11 08:30:57', '2024-11-11 08:30:57'),
(175, 'Tonga', 'Tongan', '2024-11-11 08:30:57', '2024-11-11 08:30:57'),
(176, 'Trinidad and Tobago', 'Trinidadian or Tobagonian', '2024-11-11 08:30:57', '2024-11-11 08:30:57'),
(177, 'Tunisia', 'Tunisian', '2024-11-11 08:30:57', '2024-11-11 08:30:57'),
(178, 'Turkey', 'Turkish', '2024-11-11 08:30:57', '2024-11-11 08:30:57'),
(179, 'Turkmenistan', 'Turkmen', '2024-11-11 08:30:57', '2024-11-11 08:30:57'),
(180, 'Tuvalu', 'Tuvaluan', '2024-11-11 08:30:57', '2024-11-11 08:30:57'),
(181, 'Uganda', 'Ugandan', '2024-11-11 08:30:57', '2024-11-11 08:30:57'),
(182, 'Ukraine', 'Ukrainian', '2024-11-11 08:30:57', '2024-11-11 08:30:57'),
(183, 'United Arab Emirates', 'Emirati', '2024-11-11 08:30:57', '2024-11-11 08:30:57'),
(184, 'United Kingdom', 'British', '2024-11-11 08:30:57', '2024-11-11 08:30:57'),
(185, 'United States', 'American', '2024-11-11 08:30:57', '2024-11-11 08:30:57'),
(186, 'Uruguay', 'Uruguayan', '2024-11-11 08:30:57', '2024-11-11 08:30:57'),
(187, 'Uzbekistan', 'Uzbek', '2024-11-11 08:30:57', '2024-11-11 08:30:57'),
(188, 'Vanuatu', 'Ni-Vanuatu', '2024-11-11 08:30:57', '2024-11-11 08:30:57'),
(189, 'Vatican City', 'Vatican', '2024-11-11 08:30:57', '2024-11-11 08:30:57'),
(190, 'Venezuela', 'Venezuelan', '2024-11-11 08:30:57', '2024-11-11 08:30:57'),
(191, 'Vietnam', 'Vietnamese', '2024-11-11 08:30:57', '2024-11-11 08:30:57'),
(192, 'Yemen', 'Yemeni', '2024-11-11 08:30:57', '2024-11-11 08:30:57'),
(193, 'Zambia', 'Zambian', '2024-11-11 08:30:57', '2024-11-11 08:30:57'),
(194, 'Zimbabwe', 'Zimbabwean', '2024-11-11 08:30:57', '2024-11-11 08:30:57');

-- --------------------------------------------------------

--
-- Table structure for table `navgroup`
--

CREATE TABLE `navgroup` (
  `groupid` int(11) DEFAULT NULL,
  `navid` int(11) DEFAULT NULL,
  `status` int(11) DEFAULT NULL
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `navgroup`
--

INSERT INTO `navgroup` (`groupid`, `navid`, `status`) VALUES
(2, 1, NULL),
(2, 2, NULL),
(2, 3, NULL),
(2, 4, NULL),
(2, 5, NULL),
(2, 6, NULL),
(2, 7, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `navigationlist`
--

CREATE TABLE `navigationlist` (
  `ID` int(11) NOT NULL,
  `NavigationName` varchar(50) NOT NULL,
  `PageName` varchar(50) NOT NULL,
  `NavType` int(11) NOT NULL,
  `ParentID` int(11) NOT NULL,
  `Icon` varchar(50) NOT NULL
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `navigationlist`
--

INSERT INTO `navigationlist` (`ID`, `NavigationName`, `PageName`, `NavType`, `ParentID`, `Icon`) VALUES
(1, 'Navigation Pages', '', 0, 0, ''),
(2, 'Account Pages', '', 0, 0, ''),
(3, 'Navigation', 'Navigation', 1, 1, 'menu'),
(4, 'Application List', 'appmgmtlist', 1, 1, 'apps'),
(5, 'Profile', 'profile', 1, 2, 'person'),
(7, 'Users', 'OnlineUsers', 1, 2, 'group'),
(26, 'Settings', '', 0, 0, ''),
(27, 'Groups', 'groupsmgmt', 1, 26, 'group'),
(28, 'Login Attempts', 'loginattempts', 1, 26, 'login');

-- --------------------------------------------------------

--
-- Table structure for table `permission_groups`
--

CREATE TABLE `permission_groups` (
  `id` int(10) UNSIGNED NOT NULL,
  `name` varchar(191) NOT NULL,
  `permissions` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `permission_groups`
--

INSERT INTO `permission_groups` (`id`, `name`, `permissions`, `created_at`, `updated_at`) VALUES
(2, 'ADMIN', '{\"superuser\":\"0\",\"admin\":\"1\",\"import\":\"0\",\"reports.view\":\"0\",\"assets.view\":\"0\",\"assets.create\":\"0\",\"assets.edit\":\"0\",\"assets.delete\":\"0\",\"assets.checkin\":\"0\",\"assets.checkout\":\"0\",\"assets.audit\":\"0\",\"assets.view.requestable\":\"0\",\"accessories.view\":\"1\",\"accessories.create\":\"1\",\"accessories.edit\":\"1\",\"accessories.delete\":\"1\",\"accessories.checkout\":\"1\",\"accessories.checkin\":\"1\",\"consumables.view\":\"1\",\"consumables.create\":\"1\",\"consumables.edit\":\"1\",\"consumables.delete\":\"1\",\"consumables.checkout\":\"1\",\"licenses.view\":\"1\",\"licenses.create\":\"1\",\"licenses.edit\":\"1\",\"licenses.delete\":\"1\",\"licenses.checkout\":\"1\",\"licenses.keys\":\"1\",\"licenses.files\":\"1\",\"components.view\":\"1\",\"components.create\":\"1\",\"components.edit\":\"1\",\"components.delete\":\"1\",\"components.checkout\":\"1\",\"components.checkin\":\"1\",\"kits.view\":\"1\",\"kits.create\":\"1\",\"kits.edit\":\"1\",\"kits.delete\":\"1\",\"users.view\":\"1\",\"users.create\":\"1\",\"users.edit\":\"1\",\"users.delete\":\"1\",\"models.view\":\"1\",\"models.create\":\"1\",\"models.edit\":\"1\",\"models.delete\":\"1\",\"categories.view\":\"1\",\"categories.create\":\"1\",\"categories.edit\":\"1\",\"categories.delete\":\"1\",\"departments.view\":\"1\",\"departments.create\":\"1\",\"departments.edit\":\"1\",\"departments.delete\":\"1\",\"statuslabels.view\":\"1\",\"statuslabels.create\":\"1\",\"statuslabels.edit\":\"1\",\"statuslabels.delete\":\"1\",\"customfields.view\":\"1\",\"customfields.create\":\"1\",\"customfields.edit\":\"1\",\"customfields.delete\":\"1\",\"suppliers.view\":\"1\",\"suppliers.create\":\"1\",\"suppliers.edit\":\"1\",\"suppliers.delete\":\"1\",\"manufacturers.view\":\"1\",\"manufacturers.create\":\"1\",\"manufacturers.edit\":\"1\",\"manufacturers.delete\":\"1\",\"depreciations.view\":\"1\",\"depreciations.create\":\"1\",\"depreciations.edit\":\"1\",\"depreciations.delete\":\"1\",\"locations.view\":\"1\",\"locations.create\":\"1\",\"locations.edit\":\"1\",\"locations.delete\":\"1\",\"companies.view\":\"1\",\"companies.create\":\"1\",\"companies.edit\":\"1\",\"companies.delete\":\"1\",\"self.two_factor\":\"1\",\"self.api\":\"1\",\"self.edit_location\":\"1\",\"self.checkout_assets\":\"1\"}', '2022-10-01 03:09:56', '2022-10-05 07:38:50'),
(5, 'USR', NULL, '2022-10-01 03:09:56', '2023-04-11 20:05:40'),
(16, 'SUPERUSER', NULL, '2023-04-09 08:58:22', NULL),
(17, 'ATG-GROUP', NULL, '2023-04-11 21:24:10', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `personnels`
--

CREATE TABLE `personnels` (
  `personnel_id` bigint(20) NOT NULL,
  `reference_number` varchar(25) DEFAULT NULL,
  `enrollment_progress` enum('1','2','3','4','5','6','7','8','9','10') DEFAULT NULL,
  `personnel_progress` enum('District Office','Section Chief(first_attempt)','Enrollment','Security Section','ATG Office','PMD-IT','Personnel Office','Section Chief') DEFAULT NULL,
  `gender` enum('Male','Female') DEFAULT NULL,
  `civil_status` enum('Single','Married','Divorced') DEFAULT NULL,
  `wedding_anniversary` datetime DEFAULT NULL,
  `givenname` varchar(50) DEFAULT NULL,
  `middlename` text DEFAULT NULL,
  `surname_maiden` varchar(50) DEFAULT NULL,
  `surname_husband` varchar(50) NOT NULL,
  `suffix` text DEFAULT NULL,
  `nickname` varchar(50) DEFAULT NULL,
  `date_of_birth` datetime DEFAULT NULL,
  `place_of_birth` varchar(50) DEFAULT NULL,
  `datejoined` datetime DEFAULT NULL,
  `language_id` varchar(50) DEFAULT NULL,
  `bloodtype` varchar(10) DEFAULT NULL,
  `email_address` varchar(50) DEFAULT NULL,
  `citizenship` int(11) DEFAULT NULL,
  `nationality` int(11) DEFAULT NULL,
  `department_id` int(11) DEFAULT NULL,
  `section_id` int(11) DEFAULT NULL,
  `subsection_id` int(11) DEFAULT NULL,
  `designation_id` int(11) DEFAULT NULL,
  `district_id` int(11) DEFAULT NULL,
  `local_congregation` varchar(50) DEFAULT NULL,
  `personnel_type` enum('Minister','Regular','Ministerial Student','Minister''s Wife','Lay Member') DEFAULT NULL,
  `assigned_number` int(11) DEFAULT NULL,
  `m_status` enum('May Destino','Fulltime') DEFAULT NULL,
  `panunumpa_date` datetime DEFAULT NULL,
  `ordination_date` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `personnels`
--

INSERT INTO `personnels` (`personnel_id`, `reference_number`, `enrollment_progress`, `personnel_progress`, `gender`, `civil_status`, `wedding_anniversary`, `givenname`, `middlename`, `surname_maiden`, `surname_husband`, `suffix`, `nickname`, `date_of_birth`, `place_of_birth`, `datejoined`, `language_id`, `bloodtype`, `email_address`, `citizenship`, `nationality`, `department_id`, `section_id`, `subsection_id`, `designation_id`, `district_id`, `local_congregation`, `personnel_type`, `assigned_number`, `m_status`, `panunumpa_date`, `ordination_date`, `created_at`, `updated_at`) VALUES
(2, NULL, '1', 'District Office', 'Male', 'Single', NULL, 'Felix', NULL, 'Pareja', '', NULL, 'Chok', '1990-11-09 10:57:12', 'Quezon City', NULL, 'Tagalog, English', 'O+', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2024-11-06 03:54:49', '2024-11-06 03:54:49'),
(3, '', '1', '', 'Male', 'Single', '0000-00-00 00:00:00', 'Kim Roland', 'Test', '', 'Amaro', '', 'Kim', '2024-11-11 00:00:00', 'QC', '2024-11-11 00:00:00', NULL, 'A-', 'kim@yahoo.com', 0, 0, 0, 0, 0, 0, 0, 'Central', 'Regular', 16123, NULL, '2019-11-11 00:00:00', '0000-00-00 00:00:00', '2024-11-11 06:02:58', '2024-11-11 06:02:58'),
(4, '', '1', '', 'Male', 'Single', '0000-00-00 00:00:00', 'Kyrt', 'Test', '', 'Jurada', '', 'Kim', '2024-11-11 00:00:00', 'QC', '2024-11-11 00:00:00', NULL, 'A-', 'kim@yahoo.com', 0, 0, 0, 0, 0, 0, 0, 'Central', 'Regular', 16123, NULL, '2019-11-11 00:00:00', '0000-00-00 00:00:00', '2024-11-11 06:04:51', '2024-11-11 06:04:51'),
(5, 'ENR-2411-EP1-6905', '1', '', 'Male', 'Single', '0000-00-00 00:00:00', 'Adrian', 'Test', '', 'Amado', '', 'Adrian', '2024-11-11 00:00:00', 'QC', '2024-11-11 00:00:00', NULL, 'A-', 'kim@yahoo.com', 0, 0, 0, 0, 0, 0, 0, 'Central', 'Regular', 15123, NULL, '2019-11-11 00:00:00', '0000-00-00 00:00:00', '2024-11-11 06:29:24', '2024-11-11 06:29:24'),
(6, 'ENR-2411-EP1-1234', '1', 'District Office', 'Male', 'Single', '0000-00-00 00:00:00', 'Aldrin', 'Test', '', 'Salvador', '', 'Aldrin', '2024-11-11 00:00:00', 'QC', '2024-11-11 00:00:00', NULL, 'A-', 'kim@yahoo.com', 0, 0, 0, 0, 0, 0, 0, 'Central', 'Regular', 20123, NULL, '2022-11-09 00:00:00', '0000-00-00 00:00:00', '2024-11-11 06:31:55', '2024-11-11 06:31:55');

-- --------------------------------------------------------

--
-- Table structure for table `personnel_gov_id`
--

CREATE TABLE `personnel_gov_id` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `personnel_gov_id`
--

INSERT INTO `personnel_gov_id` (`id`, `name`) VALUES
(1, 'Barangay ID'),
(2, 'Chief Executive Officer (CEO) ID'),
(3, 'Driver’s License'),
(4, 'Government Service Insurance System (GSIS) e-Card'),
(5, 'National ID (Philippine Identification System or PhilSys ID)'),
(6, 'OFW ID (Overseas Filipino Worker ID)'),
(7, 'Philippine Health Insurance Corporation (PhilHealth) ID'),
(8, 'Philippine Passport'),
(9, 'Philippine Statistics Authority (PSA) Birth Certificate'),
(10, 'Postal ID'),
(11, 'PWD ID (Persons with Disabilities)'),
(12, 'Seafarer’s ID'),
(13, 'Senior Citizens ID'),
(14, 'Social Security System (SSS) ID'),
(15, 'Tax Identification Number (TIN) ID'),
(16, 'Unified Multi-Purpose ID (UMID)'),
(17, 'Voter’s ID');

-- --------------------------------------------------------

--
-- Table structure for table `reminders`
--

CREATE TABLE `reminders` (
  `id` int(11) NOT NULL,
  `title` varchar(50) DEFAULT NULL,
  `description` varchar(100) NOT NULL,
  `date` datetime NOT NULL,
  `time` datetime NOT NULL,
  `message` varchar(250) DEFAULT NULL,
  `created_by` int(11) NOT NULL
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `sections`
--

CREATE TABLE `sections` (
  `id` int(11) NOT NULL,
  `name` varchar(50) NOT NULL,
  `image_url` text NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `siblings`
--

CREATE TABLE `siblings` (
  `id` bigint(20) NOT NULL,
  `personnel_id` bigint(20) NOT NULL,
  `firstname` varchar(50) NOT NULL,
  `secondname` varchar(50) DEFAULT NULL,
  `middlname` text DEFAULT NULL,
  `lastname` varchar(50) NOT NULL,
  `suffix` text DEFAULT NULL,
  `date_of_birth` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `spouses`
--

CREATE TABLE `spouses` (
  `id` bigint(20) NOT NULL,
  `personnel_id` bigint(20) NOT NULL,
  `firstname` varchar(50) NOT NULL,
  `secondname` varchar(50) DEFAULT NULL,
  `middlname` text DEFAULT NULL,
  `lastname` varchar(50) NOT NULL,
  `suffix` text DEFAULT NULL,
  `date_of_birth` date DEFAULT NULL,
  `education_level` varchar(50) DEFAULT NULL,
  `field_of_study` varchar(100) DEFAULT NULL,
  `university_name` varchar(100) DEFAULT NULL,
  `graduation_date` date DEFAULT NULL,
  `job_title` varchar(100) DEFAULT NULL,
  `company_name` varchar(100) DEFAULT NULL,
  `industry` varchar(50) DEFAULT NULL,
  `work_experience` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `subsections`
--

CREATE TABLE `subsections` (
  `id` int(11) NOT NULL,
  `department_id` int(11) NOT NULL,
  `section_id` int(11) NOT NULL,
  `name` varchar(50) NOT NULL,
  `image_url` text NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `ID` int(11) NOT NULL,
  `uid` varchar(25) DEFAULT NULL,
  `personnel_id` int(11) DEFAULT NULL,
  `avatar` text DEFAULT NULL,
  `username` varchar(25) DEFAULT NULL,
  `password` varchar(150) NOT NULL,
  `isLoggedIn` tinyint(11) DEFAULT NULL,
  `last_login` timestamp NULL DEFAULT NULL,
  `auth_type` enum('LDAP','Local') NOT NULL,
  `failed_attempts` int(11) DEFAULT NULL,
  `last_failed_attempt` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`ID`, `uid`, `personnel_id`, `avatar`, `username`, `password`, `isLoggedIn`, `last_login`, `auth_type`, `failed_attempts`, `last_failed_attempt`, `created_at`, `updated_at`) VALUES
(1, 'claudioarro', NULL, NULL, 'claudioarro', '{SSHA}+3VbtcZxSkn5v8nhLBdwPbRQPOBbcII3', 0, NULL, 'LDAP', 0, NULL, '2024-11-07 04:04:58', '2024-11-07 04:04:58'),
(2, 'cmcervantes', NULL, NULL, 'cmcervantes', '{MD5}d5xp2teod+ZzCrsJ+3H1yQ==', 0, NULL, 'LDAP', 0, NULL, '2024-11-07 04:04:58', '2024-11-07 04:04:58'),
(3, 'amagpile', NULL, NULL, 'amagpile', '{MD5}3PbHEQTkbxTTefuWRiARAg==', 0, NULL, 'LDAP', 0, NULL, '2024-11-07 04:04:58', '2024-11-07 04:04:58'),
(4, 'rmmalabanan', NULL, NULL, 'rmmalabanan', '{MD5}dDdpUA4QjNwSG35UEFTD9Q==', 0, NULL, 'LDAP', 0, NULL, '2024-11-07 04:04:58', '2024-11-07 04:04:58'),
(5, 'mcenriquez', NULL, NULL, 'mcenriquez', '{SSHA}K5M+sv8gd5M7zoxTutWZWQlDBUgpU9uu', 0, NULL, 'LDAP', 0, NULL, '2024-11-07 04:04:58', '2024-11-07 04:04:58'),
(6, 'pcdiaz', NULL, NULL, 'pcdiaz', '{MD5}cRox3Dh47pUtklaRnQMF9w==', 0, NULL, 'LDAP', 0, NULL, '2024-11-07 04:04:58', '2024-11-07 04:04:58'),
(7, 'dvillamarzo', NULL, NULL, 'dvillamarzo', '{MD5}sUVO9gmCQXVMEGWc18MiVQ==', 0, NULL, 'LDAP', 0, NULL, '2024-11-07 04:04:58', '2024-11-07 04:04:58'),
(8, 'jcabacungan', NULL, NULL, 'jcabacungan', '{MD5}ciPSWmnDFftvBezZ3JZR7Q==', 0, NULL, 'LDAP', 0, NULL, '2024-11-07 04:04:58', '2024-11-07 04:04:58'),
(9, 'jsarmiento', NULL, NULL, 'jsarmiento', '{MD5}4xlkqIDIMJQNZdevSRDPkg==', 0, NULL, 'LDAP', 0, NULL, '2024-11-07 04:04:58', '2024-11-07 04:04:58'),
(10, 'kdeleon', NULL, NULL, 'kdeleon', '{MD5}jquH4+vzqn9KN0mZlEs2ew==', 0, NULL, 'LDAP', 0, NULL, '2024-11-07 04:04:58', '2024-11-07 04:04:58'),
(11, 'jalcantara', NULL, NULL, 'jalcantara', '{MD5}0IyoNQCSDDbEMKLla4SxoQ==', 0, NULL, 'LDAP', 0, NULL, '2024-11-07 04:04:58', '2024-11-07 04:04:58'),
(12, 'dpareña', NULL, NULL, 'dpareña', '{MD5}zemE0W2p/+wTKn1Bn8fGUQ==', 0, NULL, 'LDAP', 0, NULL, '2024-11-07 04:04:58', '2024-11-07 04:04:58'),
(13, 'rporcado', NULL, NULL, 'rporcado', '{SSHA}O0qjoUzs1AgMpzE7Ig3HURYjjKNLduyN', 0, NULL, 'LDAP', 0, NULL, '2024-11-07 04:04:58', '2024-11-07 04:04:58'),
(14, 'rdprestoza', NULL, NULL, 'rdprestoza', '{MD5}MAvZAgOvfEpDo3OKrwzNHw==', 0, NULL, 'LDAP', 0, NULL, '2024-11-07 04:04:58', '2024-11-07 04:04:58'),
(15, 'kvdematera', NULL, NULL, 'kvdematera', '{SSHA}+728w4RErOoPkuPO2W5zP1n6+cAkj1Ru', 0, NULL, 'LDAP', 0, NULL, '2024-11-07 04:04:58', '2024-11-07 04:04:58'),
(16, 'rreyes', NULL, NULL, 'rreyes', '{MD5}WDUuJDKCc7XD+0pC/8DHwg==', 0, NULL, 'LDAP', 0, NULL, '2024-11-07 04:04:58', '2024-11-07 04:04:58'),
(17, 'zpetorio', NULL, NULL, 'zpetorio', '{SSHA}Q2+NyJ1+Fhx4XN6H1W7n3xvmqmHK0Gvc', 0, NULL, 'LDAP', 0, NULL, '2024-11-07 04:04:58', '2024-11-07 04:04:58'),
(18, 'ATG', NULL, NULL, 'ATG', '{MD5}jMnoutNavel8/QA7J2mK3g==', 0, NULL, 'LDAP', 0, NULL, '2024-11-07 04:04:58', '2024-11-07 04:04:58'),
(19, 'pmdit', NULL, NULL, 'pmdit', '{SSHA}1c2pNTw54K4Avjn7GQ90PMyXBD714zOt', 0, NULL, 'LDAP', 0, NULL, '2024-11-07 04:04:58', '2024-11-07 04:04:58'),
(20, 'atgstaff', NULL, NULL, 'atgstaff', '{SSHA}gy6OWTydaQLnRY11qhdccao0Add7gNdz', 0, NULL, 'LDAP', 0, NULL, '2024-11-07 04:04:58', '2024-11-07 04:04:58'),
(21, 'eeustaquio', NULL, NULL, 'eeustaquio', '{MD5}tRnpZ0iqYDF7QA4j1EFfkw==', 0, NULL, 'LDAP', 0, NULL, '2024-11-07 04:04:58', '2024-11-07 04:04:58'),
(22, 'rolandkim.amaro', NULL, NULL, 'rolandkim.amaro', '{MD5}Mo44VG5oZyexF0jNwGQNiQ==', 0, NULL, 'LDAP', 0, NULL, '2024-11-07 04:04:58', '2024-11-07 04:04:58'),
(23, 'test', NULL, NULL, 'test', '{SSHA}fwON2kpe0RkoPqda45A4uC7TfiXvd+Yh', 0, NULL, 'LDAP', 0, NULL, '2024-11-07 04:04:58', '2024-11-07 04:04:58'),
(24, 'kyrt.jurada', NULL, NULL, 'kyrt.jurada', '{MD5}cQyCormYGW8ZV0eHcil/tw==', 0, NULL, 'LDAP', 0, NULL, '2024-11-07 04:04:58', '2024-11-07 04:04:58'),
(25, 'admin.archiving', NULL, NULL, 'admin.archiving', '{SSHA}jO7uycWuSuI1bz2M/cE5W4nd5pFoPgho', 0, NULL, 'LDAP', 0, NULL, '2024-11-07 04:04:58', '2024-11-07 04:04:58'),
(26, 'atg.office', NULL, NULL, 'atg.office', '{MD5}cQyCormYGW8ZV0eHcil/tw==', 0, NULL, 'LDAP', 0, NULL, '2024-11-07 04:04:58', '2024-11-07 04:04:58'),
(27, 'admin.building-admin', NULL, NULL, 'admin.building-admin', '{MD5}cQyCormYGW8ZV0eHcil/tw==', 0, NULL, 'LDAP', 0, NULL, '2024-11-07 04:04:58', '2024-11-07 04:04:58'),
(28, 'atg.evmedia', NULL, NULL, 'atg.evmedia', '{MD5}cQyCormYGW8ZV0eHcil/tw==', 0, NULL, 'LDAP', 0, NULL, '2024-11-07 04:04:58', '2024-11-07 04:04:58'),
(29, 'atg.sfm', NULL, NULL, 'atg.sfm', '{MD5}cQyCormYGW8ZV0eHcil/tw==', 0, NULL, 'LDAP', 0, NULL, '2024-11-07 04:04:58', '2024-11-07 04:04:58'),
(30, 'atg.security-group', NULL, NULL, 'atg.security-group', '{MD5}cQyCormYGW8ZV0eHcil/tw==', 0, NULL, 'LDAP', 0, NULL, '2024-11-07 04:04:58', '2024-11-07 04:04:58'),
(31, 'atg.subtitling', NULL, NULL, 'atg.subtitling', '{MD5}cQyCormYGW8ZV0eHcil/tw==', 0, NULL, 'LDAP', 0, NULL, '2024-11-07 04:04:58', '2024-11-07 04:04:58'),
(32, 'admin.gnd', NULL, NULL, 'admin.gnd', '{MD5}cQyCormYGW8ZV0eHcil/tw==', 0, NULL, 'LDAP', 0, NULL, '2024-11-07 04:04:58', '2024-11-07 04:04:58'),
(33, 'atg.lsws', NULL, NULL, 'atg.lsws', '{MD5}cQyCormYGW8ZV0eHcil/tw==', 0, NULL, 'LDAP', 0, NULL, '2024-11-07 04:04:58', '2024-11-07 04:04:58'),
(34, 'music.cdo', NULL, NULL, 'music.cdo', '{MD5}cQyCormYGW8ZV0eHcil/tw==', 0, NULL, 'LDAP', 0, NULL, '2024-11-07 04:04:58', '2024-11-07 04:04:58'),
(35, 'music.eis', NULL, NULL, 'music.eis', '{MD5}cQyCormYGW8ZV0eHcil/tw==', 0, NULL, 'LDAP', 0, NULL, '2024-11-07 04:04:58', '2024-11-07 04:04:58'),
(36, 'music.hymns', NULL, NULL, 'music.hymns', '{MD5}cQyCormYGW8ZV0eHcil/tw==', 0, NULL, 'LDAP', 0, NULL, '2024-11-07 04:04:58', '2024-11-07 04:04:58'),
(37, 'music.organ-office', NULL, NULL, 'music.organ-office', '{MD5}cQyCormYGW8ZV0eHcil/tw==', 0, NULL, 'LDAP', 0, NULL, '2024-11-07 04:04:58', '2024-11-07 04:04:58'),
(38, 'music.original-music', NULL, NULL, 'music.original-music', '{MD5}cQyCormYGW8ZV0eHcil/tw==', 0, NULL, 'LDAP', 0, NULL, '2024-11-07 04:04:58', '2024-11-07 04:04:58'),
(39, 'admin.trg', NULL, NULL, 'admin.trg', '{MD5}cQyCormYGW8ZV0eHcil/tw==', 0, NULL, 'LDAP', 0, NULL, '2024-11-07 04:04:58', '2024-11-07 04:04:58'),
(40, 'user-b', NULL, NULL, 'user-b', '{SSHA}68Js8c84DFwfeATxN8lBtLhcUENRKyOA', 0, NULL, 'LDAP', 0, NULL, '2024-11-07 04:04:58', '2024-11-07 04:04:58'),
(41, 'user.a', NULL, NULL, 'user.a', '{SSHA}GjHeaMA6xyjRtPHLc6oR+JTnmTIeJYv7', 0, NULL, 'LDAP', 0, NULL, '2024-11-07 04:04:58', '2024-11-07 04:04:58'),
(42, 'neu.stf', NULL, NULL, 'neu.stf', '{MD5}cQyCormYGW8ZV0eHcil/tw==', 0, NULL, 'LDAP', 0, NULL, '2024-11-07 04:04:58', '2024-11-07 04:04:58'),
(43, 'executive.news', NULL, NULL, 'executive.news', '{MD5}cQyCormYGW8ZV0eHcil/tw==', 0, NULL, 'LDAP', 0, NULL, '2024-11-07 04:04:58', '2024-11-07 04:04:58'),
(44, 'pmd.it', NULL, NULL, 'pmd.it', '{SSHA}LYVyCEUbqbnRdJMh/NGuR38z6zbsDKG+', 0, NULL, 'LDAP', 0, NULL, '2024-11-07 04:04:58', '2024-11-07 04:04:58'),
(45, 'r.deguzman', NULL, NULL, 'r.deguzman', '{MD5}cQyCormYGW8ZV0eHcil/tw==', 0, NULL, 'LDAP', 0, NULL, '2024-11-07 04:04:58', '2024-11-07 04:04:58'),
(46, 'felix.pareja', 2, NULL, 'felix.pareja', '{MD5}cQyCormYGW8ZV0eHcil/tw==', 1, NULL, 'LDAP', 0, NULL, '2024-11-07 04:04:58', '2024-11-07 04:04:58'),
(47, 'nsanchez', NULL, NULL, 'nsanchez', '{MD5}4vh3FhfOq3i3zcUJki6UBg==', 0, NULL, 'LDAP', 0, NULL, '2024-11-07 04:04:58', '2024-11-07 04:04:58'),
(48, NULL, NULL, NULL, 'admin', '$2a$12$ZXhnczgjZG4QAa4oGMH5eOt0.a9urccMHJ0/FBYB5zCe2/zfh3dEO', 0, NULL, 'Local', NULL, NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `user_appslist`
--

CREATE TABLE `user_appslist` (
  `id` int(11) NOT NULL,
  `groupid` int(11) DEFAULT NULL,
  `appid` int(11) NOT NULL
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `user_appslist`
--

INSERT INTO `user_appslist` (`id`, `groupid`, `appid`) VALUES
(1, 2, 1),
(23, 5, 3),
(3, 2, 3),
(4, 2, 4),
(6, 5, 1),
(8, 2, 139),
(9, 2, 140),
(10, 2, 141),
(11, 2, 142),
(12, 2, 143),
(46, 16, 149),
(54, 2, 149),
(24, 5, 143),
(39, 17, 1),
(27, 12, 2),
(28, 12, 143),
(29, 16, 1),
(30, 16, 2),
(31, 16, 3),
(32, 16, 4),
(33, 16, 139),
(34, 16, 140),
(35, 16, 141),
(36, 16, 142),
(37, 16, 143),
(45, 2, 147),
(40, 17, 4),
(41, 17, 143),
(42, 16, 148),
(43, 16, 148),
(47, 16, 152),
(48, 16, 151),
(49, 16, 150),
(50, 16, 153),
(51, 17, 154),
(52, 16, 155),
(53, 2, 151),
(55, 2, 140),
(57, 2, 1),
(58, 2, 1),
(59, 2, 1),
(60, 2, 1),
(61, 2, 1),
(62, 2, 1),
(63, 2, 1),
(64, 2, 1),
(65, 2, 1);

-- --------------------------------------------------------

--
-- Table structure for table `user_navlist`
--

CREATE TABLE `user_navlist` (
  `groupid` int(11) NOT NULL,
  `NavID` int(11) NOT NULL
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `user_navlist`
--

INSERT INTO `user_navlist` (`groupid`, `NavID`) VALUES
(2, 28),
(2, 27),
(2, 26),
(2, 7),
(2, 6),
(2, 5),
(12, 4),
(2, 2),
(2, 4),
(2, 1),
(5, 5),
(12, 3),
(12, 1),
(5, 2),
(16, 28),
(16, 27),
(16, 26),
(16, 7),
(16, 6),
(16, 5),
(16, 2),
(16, 4),
(16, 3),
(16, 1),
(17, 27),
(17, 26),
(17, 7),
(17, 6),
(17, 5),
(17, 2),
(17, 4),
(17, 1);

-- --------------------------------------------------------

--
-- Table structure for table `work_background`
--

CREATE TABLE `work_background` (
  `id` bigint(20) NOT NULL,
  `personnel_id` bigint(20) NOT NULL,
  `company` varchar(50) NOT NULL,
  `position` varchar(50) NOT NULL,
  `department` varchar(50) DEFAULT NULL,
  `section` varchar(50) DEFAULT NULL,
  `start_date` date NOT NULL,
  `end_date` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `apps`
--
ALTER TABLE `apps`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `available_apps`
--
ALTER TABLE `available_apps`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `children`
--
ALTER TABLE `children`
  ADD PRIMARY KEY (`id`),
  ADD KEY `personnel_id` (`personnel_id`);

--
-- Indexes for table `citizenships`
--
ALTER TABLE `citizenships`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `contacts`
--
ALTER TABLE `contacts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `personnel_id` (`personnel_id`);

--
-- Indexes for table `departments`
--
ALTER TABLE `departments`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `designations`
--
ALTER TABLE `designations`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `districts`
--
ALTER TABLE `districts`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `educational_background`
--
ALTER TABLE `educational_background`
  ADD PRIMARY KEY (`id`),
  ADD KEY `personnel_id` (`personnel_id`);

--
-- Indexes for table `languages`
--
ALTER TABLE `languages`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `login_attempts`
--
ALTER TABLE `login_attempts`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `nationalities`
--
ALTER TABLE `nationalities`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `navigationlist`
--
ALTER TABLE `navigationlist`
  ADD PRIMARY KEY (`ID`);

--
-- Indexes for table `permission_groups`
--
ALTER TABLE `permission_groups`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `personnels`
--
ALTER TABLE `personnels`
  ADD PRIMARY KEY (`personnel_id`);

--
-- Indexes for table `personnel_gov_id`
--
ALTER TABLE `personnel_gov_id`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `reminders`
--
ALTER TABLE `reminders`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `sections`
--
ALTER TABLE `sections`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `siblings`
--
ALTER TABLE `siblings`
  ADD PRIMARY KEY (`id`),
  ADD KEY `personnel_id` (`personnel_id`);

--
-- Indexes for table `spouses`
--
ALTER TABLE `spouses`
  ADD PRIMARY KEY (`id`),
  ADD KEY `personnel_id` (`personnel_id`);

--
-- Indexes for table `subsections`
--
ALTER TABLE `subsections`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`ID`);

--
-- Indexes for table `user_appslist`
--
ALTER TABLE `user_appslist`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `work_background`
--
ALTER TABLE `work_background`
  ADD PRIMARY KEY (`id`),
  ADD KEY `personnel_id` (`personnel_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `apps`
--
ALTER TABLE `apps`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT for table `available_apps`
--
ALTER TABLE `available_apps`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=69;

--
-- AUTO_INCREMENT for table `children`
--
ALTER TABLE `children`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `citizenships`
--
ALTER TABLE `citizenships`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=195;

--
-- AUTO_INCREMENT for table `contacts`
--
ALTER TABLE `contacts`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `designations`
--
ALTER TABLE `designations`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `districts`
--
ALTER TABLE `districts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `educational_background`
--
ALTER TABLE `educational_background`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `languages`
--
ALTER TABLE `languages`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `login_attempts`
--
ALTER TABLE `login_attempts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=162;

--
-- AUTO_INCREMENT for table `nationalities`
--
ALTER TABLE `nationalities`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=195;

--
-- AUTO_INCREMENT for table `navigationlist`
--
ALTER TABLE `navigationlist`
  MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=44;

--
-- AUTO_INCREMENT for table `permission_groups`
--
ALTER TABLE `permission_groups`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT for table `personnels`
--
ALTER TABLE `personnels`
  MODIFY `personnel_id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `personnel_gov_id`
--
ALTER TABLE `personnel_gov_id`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT for table `reminders`
--
ALTER TABLE `reminders`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `sections`
--
ALTER TABLE `sections`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `siblings`
--
ALTER TABLE `siblings`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `spouses`
--
ALTER TABLE `spouses`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `subsections`
--
ALTER TABLE `subsections`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=49;

--
-- AUTO_INCREMENT for table `user_appslist`
--
ALTER TABLE `user_appslist`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=66;

--
-- AUTO_INCREMENT for table `work_background`
--
ALTER TABLE `work_background`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `children`
--
ALTER TABLE `children`
  ADD CONSTRAINT `children_ibfk_1` FOREIGN KEY (`personnel_id`) REFERENCES `personnels` (`personnel_id`) ON DELETE CASCADE;

--
-- Constraints for table `contacts`
--
ALTER TABLE `contacts`
  ADD CONSTRAINT `contacts_ibfk_1` FOREIGN KEY (`personnel_id`) REFERENCES `personnels` (`personnel_id`) ON DELETE CASCADE;

--
-- Constraints for table `educational_background`
--
ALTER TABLE `educational_background`
  ADD CONSTRAINT `educational_background_ibfk_1` FOREIGN KEY (`personnel_id`) REFERENCES `personnels` (`personnel_id`) ON DELETE CASCADE;

--
-- Constraints for table `siblings`
--
ALTER TABLE `siblings`
  ADD CONSTRAINT `siblings_ibfk_1` FOREIGN KEY (`personnel_id`) REFERENCES `personnels` (`personnel_id`) ON DELETE CASCADE;

--
-- Constraints for table `spouses`
--
ALTER TABLE `spouses`
  ADD CONSTRAINT `spouses_ibfk_1` FOREIGN KEY (`personnel_id`) REFERENCES `personnels` (`personnel_id`) ON DELETE CASCADE;

--
-- Constraints for table `work_background`
--
ALTER TABLE `work_background`
  ADD CONSTRAINT `work_background_ibfk_1` FOREIGN KEY (`personnel_id`) REFERENCES `personnels` (`personnel_id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
